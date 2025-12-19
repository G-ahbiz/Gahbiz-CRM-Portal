import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { ROUTES } from '@shared/config/constants';
import { ALLOWED_ROLES } from '@core/constants/auth.constants';
import { map, shareReplay, of, take } from 'rxjs';

// Module-level cache for role checks
const roleCache = new Map<string, boolean>();
let cacheSubscriptionInitialized = false;

function initializeCacheClearing(authService: AuthService): void {
  if (cacheSubscriptionInitialized) return;
  cacheSubscriptionInitialized = true;

  authService.isLoggedIn$.pipe(take(1)).subscribe(); // Ensure subscription exists
  authService.isLoggedIn$.subscribe((isLoggedIn) => {
    if (!isLoggedIn) {
      roleCache.clear();
    }
  });
}

function normalizeRoles(user: unknown, tokenService: TokenService): string[] {
  if (!user || typeof user !== 'object') return [];

  const userObj = user as Record<string, unknown>;
  const roles =
    userObj['roles'] || userObj['role'] || tokenService.extractRolesFromLocalStorage() || [];
  const roleArray = Array.isArray(roles) ? roles : [roles];

  return roleArray
    .filter((role): role is string => typeof role === 'string' && role.trim() !== '')
    .map((role) => role.trim().toLowerCase());
}

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Initialize cache clearing on first use
  initializeCacheClearing(authService);

  const cacheKey = `${state.url}-${JSON.stringify(route.data?.['roles'])}`;

  if (roleCache.has(cacheKey)) {
    return of(roleCache.get(cacheKey)!);
  }

  return authService.waitForInitialization().pipe(
    map(() => {
      if (!authService.isAuthenticated()) {
        return router.createUrlTree([ROUTES.signIn], {
          queryParams: { returnUrl: state.url },
        });
      }

      const requiredRoles: string[] = (route.data?.['roles'] as string[]) ?? [...ALLOWED_ROLES];
      const user = authService.getCurrentUser();
      const userRoles = normalizeRoles(user, tokenService);

      const hasRole = requiredRoles.some((requiredRole) =>
        userRoles.some((userRole) => userRole === requiredRole.toLowerCase())
      );

      roleCache.set(cacheKey, hasRole);

      if (!hasRole) {
        return router.createUrlTree([ROUTES.unauthorized || '/unauthorized']);
      }

      return true;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
};
