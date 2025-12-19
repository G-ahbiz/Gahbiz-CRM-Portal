import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TokenData } from '@core/interfaces/token-data';
import { User } from '@features/auth/interfaces/sign-in/user';
import { LOCAL_STORAGE_KEYS } from '@shared/config/constants';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private platformId = inject(PLATFORM_ID);

  // Cache tokens in memory for better performance
  private accessTokenCache: string | null = null;
  private refreshTokenCache: string | null = null;
  private userDataCache: User | null = null;

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Load and cache tokens from localStorage
        this.accessTokenCache = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
        this.refreshTokenCache = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);

        const userDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
        if (userDataStr) {
          this.userDataCache = JSON.parse(userDataStr);
        }
      } catch (error) {
        console.error('Error initializing TokenService from storage:', error);
        this.clearAllCaches();
      }
    }
  }

  setAccessToken(token: string): void {
    if (!this.validateToken(token)) {
      console.warn('Invalid token format');
      return;
    }

    if (!token || !isPlatformBrowser(this.platformId)) {
      console.warn('Cannot set access token - invalid token or not in browser');
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY, token);
      this.accessTokenCache = token;
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    // Return cached value first, fallback to localStorage
    if (this.accessTokenCache) {
      return this.accessTokenCache;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
    this.accessTokenCache = token; // Cache it
    return token;
  }

  setRefreshToken(token: string): void {
    if (!token || !isPlatformBrowser(this.platformId)) {
      console.warn('Cannot set refresh token - invalid token or not in browser');
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY, token);
      this.refreshTokenCache = token;
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (this.refreshTokenCache) {
      return this.refreshTokenCache;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);
    this.refreshTokenCache = token;
    return token;
  }

  setUserData(user: User): void {
    if (!user || !isPlatformBrowser(this.platformId)) {
      console.warn('Cannot set user data - invalid user or not in browser');
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY, JSON.stringify(user));
      this.userDataCache = user;
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }

  getUserData(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (this.userDataCache) {
      return this.userDataCache;
    }

    try {
      const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        this.userDataCache = parsed;
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
    }

    return null;
  }

  setTokenData(tokenData: { accessToken: string; refreshToken: string }, userData?: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Save tokens using your defined constants
      if (tokenData?.accessToken) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY, tokenData.accessToken);
        this.accessTokenCache = tokenData.accessToken;
      }

      if (tokenData?.refreshToken) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY, tokenData.refreshToken);
        this.refreshTokenCache = tokenData.refreshToken;
      }

      if (userData) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY, JSON.stringify(userData));
        this.userDataCache = userData;
        console.log('User data updated in localStorage:', userData);
      }
    } catch (error) {
      console.error('Error setting token data:', error);
    }
  }

  getTokenData(): { accessToken: string; refreshToken: string } | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
    } catch (error) {
      console.error('Error getting token data:', error);
    }

    return null;
  }

  hasAccessToken(): boolean {
    const token = this.getAccessToken();
    return token !== null && token.trim() !== '';
  }

  hasRefreshToken(): boolean {
    const token = this.getRefreshToken();
    return token !== null && token.trim() !== '';
  }

  extractRolesFromToken(tokenData?: TokenData | null): string[] | null {
    try {
      const token = tokenData?.accessToken ?? this.getAccessToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      // const base64Url = token.split('.')[1];
      // const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // const payload = JSON.parse(
      //   decodeURIComponent(
      //     atob(base64)
      //       .split('.')
      //       .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      //       .join('')
      //   )
      // );
      return (
        payload?.roles ??
        payload?.role ??
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        null
      );
    } catch {
      return null;
    }
  }

  extractRolesFromLocalStorage(): string | null {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
    if (!userData) return null;
    const payload = JSON.parse(userData);
    console.log('payload');
    return (
      payload?.type ??
      payload?.role ??
      payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      null
    );
  }

  isTokenExpired(token?: string): boolean {
    try {
      const tokenToCheck = token || this.getAccessToken();
      if (!tokenToCheck) return true;

      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const expiry = payload.exp;
      if (!expiry) return false;

      return Date.now() >= expiry * 1000;
    } catch {
      return true;
    }
  }

  validateToken(token: string): boolean {
    try {
      if (!token || token.trim() === '') return false;

      // Check if it's a valid JWT format
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Try to decode
      const payload = JSON.parse(atob(parts[1]));

      // Check for required fields
      if (!payload || typeof payload !== 'object') return false;

      return true;
    } catch {
      return false;
    }
  }

  clearAllTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
      } catch (error) {
        console.error('Error clearing tokens from localStorage:', error);
      }
    }
    this.clearAllCaches();
  }

  private clearAllCaches(): void {
    this.accessTokenCache = null;
    this.refreshTokenCache = null;
    this.userDataCache = null;
  }

  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}
