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
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  private checkAuth(url: string): Observable<boolean> | boolean {
    return this.authService.waitForInitialization().pipe(
      take(1),
      map(() => {
        if (this.authService.isAuthenticated()) {
          return true;
        }
        this.router.navigate([ROUTES.signIn], { queryParams: { returnUrl: url } });
        return false;
      }),
      catchError(() => of(false))
    );
  }
}
