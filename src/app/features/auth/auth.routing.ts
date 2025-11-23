import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/sign-in-page/sign-in-page.component').then((m) => m.SignInPageComponent),
    data: { hideHeader: true },
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/sign-in/forget-password-form/forget-password-form.component').then(
        (m) => m.ForgetPasswordFormComponent
      ),
    data: { hideHeader: true },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then((m) => m.ResetPassword),
    data: { hideHeader: true },
  },
  {
    path: 'verify-otp/:id',
    loadComponent: () =>
      import('./components/sign-in/verify-otp/verify-otp.component').then((m) => m.VerifyOtp),
    data: { hideHeader: true },
  },
  {
    path: 'new-password/:id',
    loadComponent: () =>
      import('./components/sign-in/new-password/new-password.component').then(
        (m) => m.NewPasswordComponent
      ),
    data: { hideHeader: true },
  },
];
