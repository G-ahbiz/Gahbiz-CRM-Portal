import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { REG_EXP, ROUTES } from '@shared/config/constants';
import { InputComponent } from '@shared/components/input/input.component';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-forget-password-form',
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    TranslateModule,
    InputComponent,
  ],
  templateUrl: './forget-password-form.component.html',
  styleUrls: ['./forget-password-form.component.scss'],
})
export class ForgetPasswordFormComponent implements OnDestroy {
  // Constants
  readonly ROUTES = ROUTES;

  // Signals
  isLoading = signal<boolean>(false);

  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);

  // Subject
  private destroy$ = new Subject<void>();

  // Form
  forgetPasswordForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(REG_EXP.EMAIL),
    ]),
  });

  get email() {
    return this.forgetPasswordForm.get('email');
  }

  onSubmit() {
    if (this.forgetPasswordForm.invalid) {
      this.forgetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const email = this.forgetPasswordForm.value.email as string;

    this.authService
      .forgetPassword(this.forgetPasswordForm.value.email as string)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.succeeded) {
            this.router.navigate([ROUTES.resetPassword], {
              queryParams: { id: response.data.userId, email },
            });
          } else {
            this.toastService.error(response.message);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.toastService.error(error.message);
        },
      });
  }

  getFieldError(controlName: string): string {
    const control = this.forgetPasswordForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return this.translate.instant('AUTH.ERRORS.REQUIRED');

    if (control.errors['email'] || control.errors['pattern'])
      return this.translate.instant('AUTH.ERRORS.EMAIL');

    return this.translate.instant('AUTH.ERRORS.INVALID');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
