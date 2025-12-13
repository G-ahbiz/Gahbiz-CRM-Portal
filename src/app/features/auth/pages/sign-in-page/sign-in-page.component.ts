import { Component, inject, computed, OnDestroy, signal, HostListener } from '@angular/core';
import { SignInFormComponent } from '../../components/sign-in/sign-in-form/sign-in-form.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil, finalize } from 'rxjs';
import { LoginRequest } from '@features/auth/interfaces/sign-in/login-request';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ROUTES } from '@shared/config/constants';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-sign-in-page',
  imports: [SignInFormComponent, TranslateModule, MatIconModule, RouterModule],
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
})
export class SignInPageComponent implements OnDestroy {
  readonly ROUTES = ROUTES;
  private destroy$ = new Subject<void>();
  private isSubmitting = false;

  isLoading = signal<boolean>(false);
  isMobileView = signal<boolean>(window.innerWidth < 768);

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);

  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobileView.set(window.innerWidth < 768);
  }

  onSignInValues(values: LoginRequest) {
    // Prevent multiple submissions
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.isLoading.set(true);

    this.authService
      .login(values)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.router.navigate([ROUTES.home]);
        },
        error: (error) => {
          console.error('Login error:', error);

          // Handle different error types based on error.key
          if (error?.key === 'NOT_AUTHORIZED') {
            this.toastService.error(
              this.translate.instant('AUTH.ERRORS.NOT_AUTHORIZED') ||
                'You are not authorized to use this application.'
            );
            this.authService.logout();
          } else if (error?.key === 'FORBIDDEN') {
            this.toastService.error(
              this.translate.instant('AUTH.ERRORS.FORBIDDEN') ||
                'Access forbidden. Please contact administrator.'
            );
          } else if (error?.key === 'UNAUTHORIZED') {
            this.toastService.error(
              this.translate.instant('AUTH.ERRORS.INVALID_CREDENTIALS') ||
                'Invalid email or password.'
            );
          } else if (error?.key === 'BAD_REQUEST') {
            this.toastService.error(
              error.message ||
                this.translate.instant('AUTH.ERRORS.BAD_REQUEST') ||
                'Invalid request. Please check your input.'
            );
          } else if (error?.key === 'NETWORK_ERROR') {
            this.toastService.error(
              this.translate.instant('AUTH.ERRORS.NETWORK_ERROR') ||
                'Network error. Please check your connection and try again.'
            );
          } else {
            // Generic error handling
            this.toastService.error(
              error?.message ||
                this.translate.instant('AUTH.ERRORS.GENERIC') ||
                'Login failed. Please try again.'
            );
          }
        },
      });
  }

  navigateToHome() {
    this.router.navigate([ROUTES.home]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
