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

  constructor() {
    setTimeout(() => this.initializeAuthState(), 0);
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
            this.setAuthData(response.data.token, response.data.user);
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
