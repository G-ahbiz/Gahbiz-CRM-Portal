import { Component, signal, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ResetPasswordRequest } from '@features/auth/interfaces/sign-in/reset-password-request';
import { VerifyOtp } from '@features/auth/components/sign-in/verify-otp/verify-otp.component';
import { NewPasswordComponent } from '@features/auth/components/sign-in/new-password/new-password.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ROUTES } from '@shared/config/constants';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  imports: [VerifyOtp, NewPasswordComponent, MatIconModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnDestroy {
  // Current step in the reset password flow
  readonly ROUTES = ROUTES;

  private destroy$ = new Subject<void>();
  currentStep = signal<'verify-otp' | 'new-password'>('verify-otp');

  // Data collected from the flow
  userId = signal<string>('');
  otpCode = signal<string>('');
  newPassword = signal<string>('');
  confirmPassword = signal<string>('');

  // Loading and error states
  isLoading = signal<boolean>(false);

  // Services
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit() {
    // Get userId from query params
    this.route.queryParams.subscribe((params) => {
      this.userId.set(params['id'] || '');
    });
  }

  // Called when OTP verification is successful
  onOtpVerified(otp: string) {
    this.otpCode.set(otp);
    this.currentStep.set('new-password');
  }

  // Called when new password form is submitted
  onPasswordSubmitted(passwordData: { newPassword: string; confirmPassword: string }) {
    this.newPassword.set(passwordData.newPassword);
    this.confirmPassword.set(passwordData.confirmPassword);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    // Submit the reset password request
    this.submitResetPasswordRequest();
  }

  // Submit the final reset password request
  private submitResetPasswordRequest() {
    this.isLoading.set(true);

    const resetPasswordRequest: ResetPasswordRequest = {
      userId: this.userId(),
      otp: this.otpCode(),
      newPassword: this.newPassword(),
      confirmPassword: this.confirmPassword(),
      token: '',
    };

    this.authService
      .resetPassword(true, resetPasswordRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.success('Password reset successfully!');
            setTimeout(() => {
              this.router.navigate(['/auth/sign-in']);
            }, 2000);
          } else {
            this.toastService.error(response.message || 'Failed to reset password');
          }
        },
        error: (error) => {
          this.goBackToOtp();
          this.toastService.error(error.message || 'An error occurred while resetting password');
        },
      });
  }

  // Go back to OTP verification step
  goBackToOtp() {
    this.currentStep.set('verify-otp');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
