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

@Injectable()
// Ziad : TODO : Fix the tokens removal after refresh
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // private authService = inject(AuthService);
  // private tokenService = inject(TokenService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // const isPublic = this.isPublicRequest(request);

    // Only add token if not public
    // if (!isPublic) {
    // const accessToken = this.tokenService.getAccessToken();
    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI4NjM2YWE4Yy1jYTI1LTRkMmQtYWNlYS02NDM5ZjI4YmJhNTQiLCJlbWFpbCI6ImFkbWluQGdhaGJpei5jb20iLCJnaXZlbl9uYW1lIjoiYWRtaW5AZ2FoYml6LmNvbSIsInJvbGUiOiJBZG1pbiIsIm5iZiI6MTc2MzMyNDc2MywiZXhwIjoxNzYzOTI5NTYzLCJpYXQiOjE3NjMzMjQ3NjMsImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjcxMDEiLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdDo3MTAxIn0.iVx4vQzPGK7knpxbGttSoNwGHHL83tpvBQISbLaA2Wc';
    if (accessToken) {
      request = this.addTokenHeader(request, accessToken);
      // }
    }

    return next.handle(request);
    // .pipe(
    //   catchError((error) => {
    //     if (
    //       error instanceof HttpErrorResponse &&
    //       error.status === 401 && // Unauthorized
    //       !this.isPublicRequest(request)
    //     ) {
    //       return this.handle401Error(request, next);
    //     }
    //     return throwError(() => error);
    //   })
    // );
  }

  // Attach bearer token
  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  // Detect public endpoints (skip them)
  // private isPublicRequest(request: HttpRequest<any>): boolean {
  //   const publicEndpoints = [
  //     environment.account.signup,
  //     environment.account.login,
  //     environment.account.verifyOtp,
  //     environment.account.resendEmailConfirmation,
  //     environment.account.confirmEmail,
  //     environment.account.refresh, // handled separately
  //   ];
  //   return publicEndpoints.some((endpoint) => request.url.includes(endpoint));
  // }

  // Handle expired access token
  // private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   if (!this.isRefreshing) {
  //     this.isRefreshing = true;
  //     this.refreshTokenSubject.next(null);

  //     const refreshToken = this.tokenService.getRefreshToken();

  //     if (refreshToken) {
  //       return this.authService.refreshToken().pipe(
  //         switchMap((token) => {
  //           this.isRefreshing = false;
  //           this.refreshTokenSubject.next(token.accessToken);
  //           return next.handle(this.addTokenHeader(request, token.accessToken));
  //         }),
  //         catchError((err) => {
  //           this.isRefreshing = false;
  //           this.authService.logout();
  //           return throwError(() => err);
  //         })
  //       );
  //     } else {
  //       this.isRefreshing = false;
  //       this.authService.logout();
  //       return throwError(() => new Error('No refresh token available'));
  //     }
  //   }

  //   // Queue requests while refresh is in progress
  //   return this.refreshTokenSubject.pipe(
  //     filter((token) => token !== null),
  //     take(1),
  //     switchMap((token) => next.handle(this.addTokenHeader(request, token!)))
  //   );
  // }
}
