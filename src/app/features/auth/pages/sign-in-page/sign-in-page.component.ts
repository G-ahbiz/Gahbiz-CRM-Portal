import { Component, inject, computed, OnDestroy, signal } from '@angular/core';
import { SignInFormComponent } from '../../components/sign-in/sign-in-form/sign-in-form.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { LoginRequest } from '@features/auth/interfaces/sign-in/login-request';
import { TranslateModule } from '@ngx-translate/core';
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

  isLoading = signal<boolean>(false);

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private languageService = inject(LanguageService);
  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  onSignInValues(values: LoginRequest) {
    this.isLoading.set(true);
    this.authService
      .login(values)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.router.navigate([ROUTES.home]);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.toastService.error(error.message || 'Login failed. Please try again.');
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
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
