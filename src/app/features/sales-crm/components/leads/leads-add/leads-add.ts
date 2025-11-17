import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { ToastService } from '@core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leads-add',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './leads-add.html',
  styleUrl: './leads-add.css',
})
export class LeadsAdd {
  addLeadForm: FormGroup;
  private leadsFacadeService = inject(LeadsFacadeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  isSubmitting = signal<boolean>(false);

  constructor(private fb: FormBuilder) {
    this.addLeadForm = this.fb.group(
      {
        firstName: [
          '',
          [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s\-']+$/)],
        ],
        lastName: [
          '',
          [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s\-']+$/)],
        ],
        eMail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        phone: ['', [Validators.required, this.phoneFormatValidator]],

        // Optional fields
        userId: [''],
        servicesOfInterest: [],
        parentId: [''],
        ssn: ['', [Validators.pattern(/^\d{3}-?\d{2}-?\d{4}$/)]],
        currentCity: ['', Validators.maxLength(100)],
        fromCity: ['', Validators.maxLength(100)],
        dob: ['', [this.dateFormatValidator, this.pastDateValidator]],
        status: [null],
        source: [null],
        zipCode: ['', Validators.pattern(/^\d{5}(-\d{4})?$/)],
        city: ['', Validators.maxLength(100)],
        state: ['', Validators.maxLength(100)],
        county: ['', Validators.maxLength(100)],
        gender: ['', this.genderValidator],
        workAt: ['', Validators.maxLength(200)],
        sourceName: ['', Validators.maxLength(100)],
        notes: ['', Validators.maxLength(1000)],
      },
      {
        validators: [this.sourceConsistencyValidator],
      }
    );
  }
  // Custom Validators
  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { invalidDateFormat: 'Invalid date of birth format. Use YYYY-MM-DD or MM/DD/YYYY.' };
    }
    return null;
  }

  pastDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const date = new Date(value);
    if (!isNaN(date.getTime()) && date >= new Date()) {
      return { futureDate: 'Date of birth must be in the past.' };
    }
    return null;
  }

  genderValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const validGenders = ['Male', 'Female', 'Other', 'M', 'F', 'O'];
    if (!validGenders.some((g) => g.toLowerCase() === value.toLowerCase())) {
      return { invalidGender: 'Gender must be one of: Male, Female, Other, or M, F, O.' };
    }
    return null;
  }

  sourceConsistencyValidator(formGroup: AbstractControl): ValidationErrors | null {
    const form = formGroup as FormGroup;
    const sourceName = form.get('sourceName')?.value;
    const source = form.get('source')?.value;

    if (sourceName && (source === null || source === undefined)) {
      return { sourceRequired: 'If SourceName is provided, Source must also be specified.' };
    }

    if (source !== null && source !== undefined && !sourceName) {
      return { sourceNameRequired: 'If Source is provided, SourceName must also be specified.' };
    }

    return null;
  }
  private phoneFormatValidator(control: AbstractControl): ValidationErrors | null {
    const raw = control.value;
    if (!raw || raw.toString().trim() === '') return null;

    let v = String(raw).trim();

    v = v.replace(/^00/, '+');

    v = v.replace(/[\s-.()]/g, '');

    if (/^\d{10}$/.test(v)) {
      v = '+1' + v;
    }

    const usRegex = /^\+1[2-9]\d{9}$/;
    const intlE164 = /^\+[1-9]\d{6,14}$/;

    if (v.startsWith('+1')) {
      if (!usRegex.test(v)) return { invalidUSPhone: true };
    } else {
      if (!intlE164.test(v)) return { invalidPhone: true };
    }

    return null;
  }

  // Helper method to get validation error messages
  getErrorMessage(fieldName: string): string {
    const control = this.addLeadForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return `${fieldName} is required.`;
    if (errors['maxlength'])
      return `${fieldName} must not exceed ${errors['maxlength'].requiredLength} characters.`;
    if (errors['pattern']) return this.getPatternError(fieldName);
    if (errors['eMail']) return 'Email must be a valid email address.';
    if (errors['invalidDateFormat']) return errors['invalidDateFormat'];
    if (errors['futureDate']) return errors['futureDate'];
    if (errors['invalidGender']) return errors['invalidGender'];
    if (errors['invalidGuid']) return errors['invalidGuid'];

    return 'Invalid value.';
  }

  private getPatternError(fieldName: string): string {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return `${fieldName} cannot contain special characters. Only letters, spaces, hyphens, and apostrophes are allowed.`;
      case 'phone':
        return 'Phone number must be numeric and contain 8-15 digits.';
      case 'ssn':
        return 'SSN must be in format XXX-XX-XXXX or XXXXXXXXX.';
      case 'zipCode':
        return 'Invalid ZIP code format. Use XXXXX or XXXXX-XXXX.';
      default:
        return 'Invalid format.';
    }
  }

  checkValidity(control: string) {
    return this.addLeadForm.get(control)?.valid &&
      !this.addLeadForm.get(control)?.errors?.['required']
      ? 'text-success'
      : 'text-danger';
  }

  checkErrors(control: string) {
    return this.addLeadForm.get(control)?.errors && this.addLeadForm.get(control)?.touched;
  }

  back() {
    window.history.back();
  }

  saveLead() {
    if (this.addLeadForm.invalid) {
      this.addLeadForm.markAllAsTouched();
      this.toastService.error('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.convertToFormData(this.addLeadForm.value);

    this.leadsFacadeService.addLead(formData as any).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.succeeded) {
          this.toastService.success('Lead added successfully');
          this.router.navigate(['/main/sales/leads/leads-main']);
        } else {
          this.toastService.error(response.errors[0]);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.toastService.error(error?.error?.message || 'Failed to add lead');
      },
    });
  }

  private convertToFormData(formValue: any): FormData {
    const formData = new FormData();

    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'servicesOfInterest' && typeof value === 'string') {
          // If servicesOfInterest is a comma-separated string, split and append as array
          const services = value
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s);
          services.forEach((service: string) => {
            formData.append('servicesOfInterest[]', service);
          });
        } else {
          formData.append(key, value);
        }
      }
    });

    return formData;
  }

  cancel() {
    window.history.back();
  }
}
