import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ROUTES } from '@shared/config/constants';
import { Observable, map, of, shareReplay } from 'rxjs';
import { ALLOWED_ROLES } from '@core/constants/auth.constants';
import { TokenService } from '@core/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private roleCache = new Map<string, boolean>();

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkRoles(route, state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkRoles(childRoute, state.url);
  }

  private checkRoles(route: ActivatedRouteSnapshot, url: string): Observable<boolean> {
    const cacheKey = `${url}-${JSON.stringify(route.data?.['roles'])}`;

    if (this.roleCache.has(cacheKey)) {
      return of(this.roleCache.get(cacheKey)!);
    }

    return this.authService.waitForInitialization().pipe(
      map(() => {
        if (!this.authService.isAuthenticated()) {
          this.router.navigate([ROUTES.signIn], { queryParams: { returnUrl: url } });
          return false;
        }

        const requiredRoles: string[] = (route.data?.['roles'] as string[]) ?? [...ALLOWED_ROLES];
        const user = this.authService.getCurrentUser();
        const userRoles = this.normalizeRoles(user);

        const hasRole = requiredRoles.some((requiredRole) =>
          userRoles.some((userRole) => userRole.toLowerCase() === requiredRole.toLowerCase())
        );

        this.roleCache.set(cacheKey, hasRole);

        if (!hasRole) {
          this.router.navigate([ROUTES.unauthorized || '/unauthorized']);
          return false;
        }

        return true;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private normalizeRoles(user: any): string[] {
    if (!user) return [];

    // Extract roles from various possible locations
    const roles = user.roles || user.role || this.tokenService.extractRolesFromLocalStorage() || [];
    // Convert to array if needed
    const roleArray = Array.isArray(roles) ? roles : [roles];
    // Filter and normalize
    return roleArray
      .filter((role): role is string => typeof role === 'string' && role.trim() !== '')
      .map((role) => role.trim().toLowerCase());
  }
}
