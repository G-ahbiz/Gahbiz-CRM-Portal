import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ROUTES } from '@shared/config/constants';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitForInitialization().pipe(
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree([ROUTES.signIn], {
        queryParams: { returnUrl: state.url },
      });
    }),
    catchError(() => of(router.createUrlTree([ROUTES.signIn])))
  );
};
