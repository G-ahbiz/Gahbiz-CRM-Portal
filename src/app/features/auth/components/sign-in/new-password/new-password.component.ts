import {
  Component,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { REG_EXP } from '@shared/config/constants';
import { InputComponent } from '@shared/components/input/input.component';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-new-password',
  imports: [ReactiveFormsModule, ButtonComponent, MatIconModule, TranslateModule, InputComponent],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPasswordComponent {
  // Inputs from parent component
  userId = input<string>('');
  otpCode = input<string>('');
  isLoading = input<boolean>(false);
  // Outputs to parent component
  passwordSubmitted = output<{ newPassword: string; confirmPassword: string }>();
  goBack = output<void>();

  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  //Services
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);

  newPasswordForm = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.pattern(REG_EXP.PASSWORD)]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(REG_EXP.PASSWORD),
    ]),
  });

  get newPassword() {
    return this.newPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.newPasswordForm.get('confirmPassword');
  }

  onSubmit() {
    if (this.newPasswordForm.invalid) {
      this.newPasswordForm.markAllAsTouched();
      return;
    }

    const newPassword = this.newPasswordForm.get('newPassword')?.value;
    const confirmPassword = this.newPasswordForm.get('confirmPassword')?.value;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      this.newPasswordForm.setErrors({ mismatch: true });
    }

    // Emit the password data to parent component
    this.passwordSubmitted.emit({
      newPassword: newPassword || '',
      confirmPassword: confirmPassword || '',
    });
  }

  onGoBack() {
    this.goBack.emit();
  }

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }
  toggleShowConfirmPassword() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  getFieldError(fieldName: string): string {
    const control = this.newPasswordForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return this.translate.instant('NEW_PASSWORD.ERRORS.REQUIRED');

    if (control.errors['pattern']) {
      return this.translate.instant('NEW_PASSWORD.ERRORS.PASSWORD_PATTERN');
    }

    return this.translate.instant('NEW_PASSWORD.ERRORS.INVALID');
  }
}
