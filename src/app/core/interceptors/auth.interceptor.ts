import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { environment } from '@env/environment';

@Injectable()
// Ziad : TODO : Fix the tokens removal after refresh
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isPublic = this.isPublicRequest(request);

    // Only add token if not public
    if (!isPublic) {
      const accessToken = this.tokenService.getAccessToken();
      if (accessToken) {
        request = this.addTokenHeader(request, accessToken);
      }
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          // Handle 401 with token refresh
          if (error.status === 401 && !this.isPublicRequest(request)) {
            return this.handle401Error(request, next);
          }
          // Transform all other HTTP errors to user-friendly format
          return throwError(() => this.createAppError(error));
        }
        return throwError(() => error);
      })
    );
  }

  // Attach bearer token
  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  // Detect public endpoints (skip them)
  private isPublicRequest(request: HttpRequest<any>): boolean {
    const publicEndpoints = [
      environment.account.login,
      environment.account.verifyOtp,
      environment.account.resendEmailConfirmation,
      environment.account.confirmEmail,
      environment.account.refresh,
      environment.account.forgotPassword,
      environment.account.resendOtp,
    ];
    return publicEndpoints.some((endpoint) => request.url.includes(endpoint));
  }

  // Map HTTP status codes to user-friendly messages
  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Cannot connect to server. Please check your internet connection.';
      case 400:
        return error.error?.message || 'Invalid request data.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'Access forbidden.';
      case 404:
        return 'Resource not found.';
      case 409:
        return error.error?.message || 'A conflict occurred. Please try again.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
      case 502:
      case 503:
        return 'Server error. Please try again later.';
      default:
        return error.error?.message || 'An unexpected error occurred.';
    }
  }

  // Create standardized error object with user-friendly message
  private createAppError(error: HttpErrorResponse): Error {
    const appError = new Error(this.getErrorMessage(error));
    (appError as any).status = error.status;
    (appError as any).statusText = error.statusText;
    return appError;
  }

  // Handle expired access token
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((token) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(token.accessToken);
            return next.handle(this.addTokenHeader(request, token.accessToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next('');
            this.authService.logout();
            return throwError(() => err);
          })
        );
      } else {
        this.isRefreshing = false;
        this.refreshTokenSubject.next('');
        this.authService.logout();
        return throwError(() => new Error('No refresh token available'));
      }
    }

    // Queue requests while refresh is in progress
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        if (!token) {
          return throwError(() => new Error('Token refresh failed'));
        }
        return next.handle(this.addTokenHeader(request, token));
      })
    );
  }
}
