import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ROUTES } from '@shared/config/constants';
import { map, catchError, of } from 'rxjs';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitForInitialization().pipe(
    map(() => {
      if (authService.isAuthenticated()) {
        return router.createUrlTree([ROUTES.home]);
      }
      return true;
    }),
    // On error, allow access to auth pages (fail-open for login/signup)
    catchError(() => of(true))
  );
};
