import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
} from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ROUTES } from '@shared/config/constants';
import { Observable, take, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  checkAuth(url: string): Observable<boolean> {
    return this.authService.waitForInitialization().pipe(
      take(1),
      map(() => {
        const isAuthenticated = this.authService.isAuthenticated();
        if (isAuthenticated) {
          this.router.navigate([ROUTES.home]);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }
}
