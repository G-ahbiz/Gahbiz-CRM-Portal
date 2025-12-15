import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
  OnDestroy,
  computed,
  OnInit,
} from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Subject, takeUntil } from 'rxjs';
import { OTP_OPERATIONS, REG_EXP, ROUTES } from '@shared/config/constants';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-verify-otp',
  imports: [ButtonComponent, RouterLink, ReactiveFormsModule, MatIconModule, TranslateModule],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyOtp implements OnInit, OnDestroy {
  readonly ROUTES = ROUTES;

  readonly OTP_OPERATIONS = OTP_OPERATIONS;
  private destroy$ = new Subject<void>();
  // Input from parent component
  userId = input<string>('');
  email = signal<string>('');

  // Output to parent component
  otpVerified = output<string>();

  resendCooldown = signal<number>(0);
  private cooldownInterval?: any;

  dir = computed(() => this.languageService.direction());

  // Services
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  private route = inject(ActivatedRoute);

  isLoading = signal<boolean>(false);

  verifyPassForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      Validators.pattern(REG_EXP.OTP),
    ]),
  });

  ngOnInit() {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const e = params.get('email');
      if (e) this.email.set(e);
    });
  }

  // OTP input handling methods
  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    const inputs = Array.from(
      input.parentElement?.querySelectorAll('input') || []
    ) as HTMLInputElement[];

    // Find the first empty input before current index
    const firstEmptyIndex = inputs.findIndex((inp) => !inp.value);

    if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
      // Jump back to the first empty input
      input.value = '';
      inputs[firstEmptyIndex].focus();
      return;
    }

    // Only allow single digit
    if (!/^\d$/.test(value) && value !== '') {
      input.value = '';
      return;
    }

    // Update form control
    const currentCode = this.verifyPassForm.get('code')?.value || ''.padEnd(6, ' ');
    const newCode = currentCode.split('');
    newCode[index] = value;
    this.verifyPassForm.get('code')?.setValue(newCode.join('').trim());

    // Auto-focus next
    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }

  onPasteOtp(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6); // keep only digits, max 6

    // Fill the inputs sequentially from the first one
    const inputs = Array.from(
      (event.target as HTMLInputElement).parentElement?.querySelectorAll('input') || []
    ) as HTMLInputElement[];

    const codeArray = ''.padEnd(6, ' ').split('');
    for (let i = 0; i < digits.length; i++) {
      codeArray[i] = digits[i];
      inputs[i].value = digits[i];
    }

    this.verifyPassForm.get('code')?.setValue(codeArray.join('').trim());

    // Focus the next empty input (or stay on last if filled)
    const nextIndex = digits.length < 6 ? digits.length : 5;
    inputs[nextIndex]?.focus();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.parentElement?.querySelector(
        `input:nth-child(${index})`
      ) as HTMLInputElement;
      prevInput?.focus();
    }

    // Handle paste
    if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          this.verifyPassForm.get('code')?.setValue(digits);
          // Focus the last input
          const lastInput = input.parentElement?.querySelector(
            'input:last-child'
          ) as HTMLInputElement;
          lastInput?.focus();
        }
      });
    }
  }

  private startCooldown() {
    this.resendCooldown.set(60);
    this.cooldownInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current > 0) {
        this.resendCooldown.set(current - 1);
      } else {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  resendCode() {
    if (this.resendCooldown() > 0) return;

    this.authService
      .resendCode(this.userId(), this.OTP_OPERATIONS.FORGOT_PASSWORD)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.success(
              this.translate.instant('CONFIRM_EMAIL.MESSAGES.RESEND_SUCCESS_OTP')
            );
            this.startCooldown();
          } else {
            this.toastService.error(
              this.translate.instant(response.message || 'Failed to resend code')
            );
          }
        },
        error: (error) => {
          this.toastService.error(this.translate.instant(error.message || 'Failed to resend code'));
        },
      });
  }

  onSubmit() {
    if (this.verifyPassForm.invalid) {
      this.verifyPassForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const otpCode = this.verifyPassForm.get('code')?.value;
    this.otpVerified.emit(otpCode || '');
  }

  ngOnDestroy() {
    clearInterval(this.cooldownInterval);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
