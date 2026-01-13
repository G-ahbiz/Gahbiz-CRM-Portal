import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment';
import { LoginRequest } from '@features/auth/interfaces/sign-in/login-request';
import { User } from '@features/auth/interfaces/sign-in/user';
import { BehaviorSubject, Observable, map, catchError, throwError, take, filter } from 'rxjs';
import { TokenService } from './token.service';
import { LoginResponse } from '@features/auth/interfaces/sign-in/login-response';
import { ResetPasswordRequest } from '@features/auth/interfaces/sign-in/reset-password-request';
import { ResetPasswordResponse } from '@features/auth/interfaces/sign-in/reset-password-response';
import { TokenData } from '@core/interfaces/token-data';
import { isAnyAllowedRole } from '@core/constants/auth.constants';
import { Router } from '@angular/router';
import { ROUTES } from '@shared/config/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.baseApi;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private initializationComplete = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public initialized$ = this.initializationComplete.asObservable();

  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  readonly ROUTES = ROUTES;

  constructor() {
    // Initialize immediately in browser context
    if (typeof window !== 'undefined') {
      this.initializeAuthState();
    }
  }

  private initializeAuthState(): void {
    try {
      const user = this.tokenService.getUserData();
      const refreshToken = this.tokenService.getRefreshToken();

      if (user && refreshToken) {
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } else {
        this.clearAuthState();
      }

      this.initializationComplete.next(true);
    } catch (error) {
      this.clearAuthState();
      this.initializationComplete.next(true);
    }
  }

  // Wait for initialization before checking auth status
  waitForInitialization(): Observable<boolean> {
    return this.initialized$.pipe(
      filter((initialized) => initialized),
      take(1)
    );
  }

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}${environment.account.login}`, loginData)
      .pipe(
        map((response) => {
          if (response.succeeded && response.data) {
            const { user, token } = response.data;

            const userRoles =
              this.tokenService.extractRolesFromToken(token) ?? (user as any)?.type ?? null;

            if (!isAnyAllowedRole(userRoles)) {
              this.tokenService.clearAllTokens();
              // Throw a structured error that handleError can process
              throw {
                key: 'NOT_AUTHORIZED',
                message: 'You are not authorized to use this application.',
                isCustomError: true,
              };
            }

            this.setAuthData(token, user);
            return response.data;
          } else {
            throw new Error(response.message || 'Login failed');
          }
        }),
        catchError(this.handleError)
      );
  }

  forgetPassword(email: string): Observable<ApiResponse<{ userId: string }>> {
    return this.http
      .post<ApiResponse<{ userId: string }>>(
        `${this.apiUrl}${environment.account.forgotPassword}`,
        { email }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(
    useOtp: boolean,
    resetPasswordRequest: ResetPasswordRequest
  ): Observable<ApiResponse<ResetPasswordResponse>> {
    let params = new HttpParams().set('useOtp', useOtp);
    return this.http
      .post<ApiResponse<ResetPasswordResponse>>(
        `${this.apiUrl}${environment.account.resetPassword}`,
        resetPasswordRequest,
        { params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  resendCode(userId: string, operationType: string): Observable<ApiResponse<string>> {
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}${environment.account.resendOtp}`, {
        userId,
        operationType,
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<TokenData> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<ApiResponse<{ token: TokenData }>>(`${this.apiUrl}${environment.account.refresh}`, {
        refreshToken: refreshToken,
      })
      .pipe(
        map((response) => {
          if (response.succeeded && response.data) {
            this.tokenService.setAccessToken(response.data.token.accessToken);
            this.tokenService.setRefreshToken(response.data.token.refreshToken);
            return response.data.token;
          } else {
            throw new Error(response.message || 'Token refresh failed');
          }
        }),
        catchError((error) => {
          this.logout();
          return this.handleError(error);
        })
      );
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate([this.ROUTES.signIn]);
  }

  isAuthenticated(): boolean {
    if (!this.initializationComplete.value) {
      return false;
    }

    const tokensValid = this.tokenService.hasAccessToken() && this.tokenService.hasRefreshToken();

    const hasUser = this.currentUserSubject.value !== null;
    const result = tokensValid && hasUser;

    return result;
  }

  updateUserProfile(updatedUser: User): void {
    const currentTokenData = this.tokenService.getTokenData();

    if (currentTokenData) {
      this.tokenService.setTokenData(currentTokenData, updatedUser);
    }

    this.currentUserSubject.next(updatedUser);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  getAuthorizationHeader(): string | null {
    return this.tokenService.getAuthorizationHeader();
  }

  private setAuthData(tokenData: TokenData, userData: User): void {
    this.tokenService.setTokenData(tokenData, userData);
    this.currentUserSubject.next(userData);
    this.isLoggedInSubject.next(true);
  }

  private clearAuthState(): void {
    this.tokenService.clearAllTokens();
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  private handleError = (error: any): Observable<never> => {
    let errorKey = 'UNKNOWN_ERROR';
    let errorMessage = 'An unexpected error occurred';

    // Handle custom errors (like NotAuthorized)
    if (error?.isCustomError) {
      errorKey = error.key || 'CUSTOM_ERROR';
      errorMessage = error.message || 'An error occurred';

      return throwError(() => ({
        key: errorKey,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      }));
    }

    // Handle HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        errorKey = 'NETWORK_ERROR';
        errorMessage = `Network error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0:
            errorKey = 'NETWORK_ERROR';
            errorMessage = 'Cannot connect to server';
            break;
          case 400:
            errorKey = 'BAD_REQUEST';
            errorMessage = error.error?.message || 'Invalid request data';
            break;
          case 401:
            errorKey = 'UNAUTHORIZED';
            errorMessage = 'Session expired. Please login again';
            this.logout(); // Now 'this' will work correctly
            break;
          case 403:
            errorKey = 'FORBIDDEN';
            errorMessage = 'Access forbidden';
            break;
          case 404:
            errorKey = 'NOT_FOUND';
            errorMessage = 'Service not found';
            break;
          case 429:
            errorKey = 'TOO_MANY_REQUESTS';
            errorMessage = 'Too many requests. Please try again later';
            break;
          case 500:
            errorKey = 'SERVER_ERROR';
            errorMessage = 'Server error occurred';
            break;
          default:
            errorKey = 'UNKNOWN_ERROR';
            errorMessage = error.error?.message || `Error Code: ${error.status}`;
        }
      }
    }
    // Handle plain Error objects
    else if (error instanceof Error) {
      if (error.message === 'NotAuthorized') {
        errorKey = 'NOT_AUTHORIZED';
        errorMessage = 'You are not authorized to use this application.';
      } else {
        errorKey = 'CLIENT_ERROR';
        errorMessage = error.message || 'An error occurred';
      }
    }
    // Handle any other error type
    else {
      errorKey = error?.key || 'UNKNOWN_ERROR';
      errorMessage = error?.message || 'An unexpected error occurred';
    }

    return throwError(() => ({
      key: errorKey,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    }));
  };
}
