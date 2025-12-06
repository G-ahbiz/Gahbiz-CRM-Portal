import { Component, Input, Output, EventEmitter, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { ToastService } from '@core/services/toast.service';
import {
  ACTIVITY_TYPES,
  TRAFFIC_TYPES,
  STATUS_TYPES,
  CALL_STATUS_TYPES,
  SOURCE_TYPES,
} from '@shared/config/constants';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './activity-create.component.html',
})
export class ActivityCreateComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly ACTIVITY_TYPES = ACTIVITY_TYPES;
  readonly TRAFFIC_TYPES = TRAFFIC_TYPES;
  readonly STATUS_TYPES = STATUS_TYPES;
  readonly CALL_STATUS_TYPES = CALL_STATUS_TYPES;
  readonly SOURCE_TYPES = SOURCE_TYPES;

  @Input() leadId?: string;
  @Output() activityCreated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() refreshRequested = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(LeadsFacadeService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  activityForm!: FormGroup;
  submitting = signal<boolean>(false);
  formSubmitted = signal<boolean>(false);

  today: string = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.initializeForm();
  }

  private notNoneValidator(controlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === 'None' ? { required: `${controlName} is required` } : null;
    };
  }

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate < today
        ? { futureDate: 'Follow-up date must be today or in the future' }
        : null;
    };
  }

  private durationValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const hour = group.get('hour')?.value || 0;
      const minute = group.get('minute')?.value || 0;
      const second = group.get('second')?.value || 0;

      // Allow zero duration but validate individual fields
      const errors: any = {};

      if (hour < 0 || hour > 23) errors.invalidHour = true;
      if (minute < 0 || minute > 59) errors.invalidMinute = true;
      if (second < 0 || second > 59) errors.invalidSecond = true;

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Computed properties for validation messages
  get activityTypeErrors() {
    const control = this.activityForm.get('type');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['required']) {
        return this.translateService.instant('LEADS.VALIDATION.ACTIVITY_TYPE_REQUIRED');
      }
    }
    return null;
  }

  get trafficErrors() {
    const control = this.activityForm.get('traffic');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['required']) {
        return this.translateService.instant('LEADS.VALIDATION.TRAFFIC_TYPE_REQUIRED');
      }
    }
    return null;
  }

  get statusErrors() {
    const control = this.activityForm.get('status');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['required']) {
        return this.translateService.instant('LEADS.VALIDATION.STATUS_REQUIRED');
      }
    }
    return null;
  }

  get callStatusErrors() {
    const control = this.activityForm.get('callStatus');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['required']) {
        return this.translateService.instant('LEADS.VALIDATION.CALL_STATUS_REQUIRED');
      }
    }
    return null;
  }

  get detailsErrors() {
    const control = this.activityForm.get('details');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['required']) {
        return this.translateService.instant('LEADS.VALIDATION.DETAILS_REQUIRED');
      }
      if (control.errors?.['maxlength']) {
        return this.translateService.instant('LEADS.VALIDATION.DETAILS_MAX_LENGTH', {
          max: control.errors?.['maxlength']?.requiredLength,
        });
      }
    }
    return null;
  }

  get followUpDateErrors() {
    const control = this.activityForm.get('followUpDate');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['required']) {
        return this.translateService.instant('LEADS.VALIDATION.FOLLOW_UP_DATE_REQUIRED');
      }
      if (control.errors?.['futureDate']) {
        return this.translateService.instant('LEADS.VALIDATION.FOLLOW_UP_DATE_FUTURE');
      }
    }
    return null;
  }

  get durationErrors() {
    const durationGroup = this.activityForm.get('duration') as FormGroup;
    const errors: any = {};

    if (durationGroup?.invalid && (durationGroup?.touched || this.formSubmitted())) {
      const hourControl = durationGroup.get('hour');
      const minuteControl = durationGroup.get('minute');
      const secondControl = durationGroup.get('second');

      if (
        hourControl?.errors?.['invalidHour'] ||
        hourControl?.errors?.['min'] ||
        hourControl?.errors?.['max']
      ) {
        errors.hour = this.translateService.instant('LEADS.VALIDATION.DURATION_HOUR_RANGE');
      }
      if (
        minuteControl?.errors?.['invalidMinute'] ||
        minuteControl?.errors?.['min'] ||
        minuteControl?.errors?.['max']
      ) {
        errors.minute = this.translateService.instant('LEADS.VALIDATION.DURATION_MINUTE_RANGE');
      }
      if (
        secondControl?.errors?.['invalidSecond'] ||
        secondControl?.errors?.['min'] ||
        secondControl?.errors?.['max']
      ) {
        errors.second = this.translateService.instant('LEADS.VALIDATION.DURATION_SECOND_RANGE');
      }
    }
    return errors;
  }

  get needErrors() {
    const control = this.activityForm.get('need');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['maxlength']) {
        return this.translateService.instant('LEADS.VALIDATION.NEED_MAX_LENGTH', {
          max: control.errors?.['maxlength']?.requiredLength,
        });
      }
    }
    return null;
  }

  get opportunityPercentageErrors() {
    const control = this.activityForm.get('opportunityPercentage');
    if (control?.invalid && (control?.touched || this.formSubmitted())) {
      if (control.errors?.['min']) {
        return this.translateService.instant('LEADS.VALIDATION.OPPORTUNITY_MIN');
      }
      if (control.errors?.['max']) {
        return this.translateService.instant('LEADS.VALIDATION.OPPORTUNITY_MAX');
      }
    }
    return null;
  }

  get isFormValid() {
    return this.activityForm.valid;
  }

  initializeForm(): void {
    this.activityForm = this.fb.group({
      type: ['None', [Validators.required, this.notNoneValidator('Activity Type')]],
      traffic: ['None', [Validators.required, this.notNoneValidator('Traffic Type')]],
      status: ['None', [Validators.required, this.notNoneValidator('Status')]],
      callStatus: ['None', [Validators.required, this.notNoneValidator('Call Status')]],
      duration: this.fb.group(
        {
          hour: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
          minute: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
          second: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
        },
        { validators: this.durationValidator() }
      ),
      followUpDate: [
        this.getDefaultFollowUpDate(),
        [Validators.required, this.futureDateValidator()],
      ],
      details: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(10)]],
      source: ['None'],
      need: ['', [Validators.maxLength(200)]],
      opportunityPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  getDefaultFollowUpDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.activityForm.invalid) {
      this.markFormGroupTouched(this.activityForm);
      this.scrollToFirstInvalidField();
      return;
    }

    if (!this.leadId) {
      this.toastService.error(this.translateService.instant('LEADS.ERRORS.LEAD_NOT_FOUND'));
      return;
    }

    this.submitting.set(true);

    const formValue = this.activityForm.value;
    const payload = {
      leadId: this.leadId,
      ...formValue,
      followUpDate: new Date(formValue.followUpDate).toISOString(),
    };

    this.facade
      .createActivity(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef), // Pass destroyRef here
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.success(
              this.translateService.instant('LEADS.SUCCESS.ACTIVITY_ADDED')
            );
            this.resetForm(); // Use resetForm method instead of reset()
            this.activityCreated.emit();
            this.refreshRequested.emit(); // Emit refresh event
          } else {
            this.toastService.error(
              response.message ||
                this.translateService.instant('LEADS.ERRORS.FAILED_TO_ADD_ACTIVITY')
            );
          }
        },
        error: (error) => {
          const errorMsg = this.translateService.instant('LEADS.ERRORS.FAILED_TO_ADD_ACTIVITY');
          this.toastService.error(errorMsg);
          console.error('Error adding activity:', error);
        },
      });
  }

  onCancel(): void {
    this.activityForm.reset();
    this.formSubmitted.set(false);
    this.cancelled.emit();
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getDurationString(): string {
    const duration = this.activityForm.get('duration')?.value;
    if (!duration) return '00:00:00';
    const { hour, minute, second } = duration;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second
      .toString()
      .padStart(2, '0')}`;
  }

  private scrollToFirstInvalidField(): void {
    const firstInvalidElement = document.querySelector('.ng-invalid');
    if (firstInvalidElement) {
      firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (firstInvalidElement as HTMLElement).focus();
    }
  }

  // Helper method to check if field has error
  hasError(controlName: string, errorType: string): boolean {
    const control = this.activityForm.get(controlName);
    return control
      ? control.hasError(errorType) && (control.touched || this.formSubmitted())
      : false;
  }

  // Helper method to get field CSS classes
  getFieldClasses(controlName: string): { [key: string]: boolean } {
    const control = this.activityForm.get(controlName);
    return {
      'is-invalid': control ? control.invalid && (control.touched || this.formSubmitted()) : false,
      'is-valid': control ? control.valid && control.touched : false,
    };
  }

  // Reset form state
  resetForm(): void {
    this.activityForm.reset({
      type: 'None',
      traffic: 'None',
      status: 'None',
      callStatus: 'None',
      duration: { hour: 0, minute: 0, second: 0 },
      followUpDate: this.getDefaultFollowUpDate(),
      details: '',
      source: 'None',
      need: '',
      opportunityPercentage: 0,
    });
    this.formSubmitted.set(false);
  }
}
