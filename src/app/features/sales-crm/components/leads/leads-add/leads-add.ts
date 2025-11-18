import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
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
import { DialogModule } from 'primeng/dialog';
import { REG_EXP, USER_TYPES } from '@shared/config/constants';
import { MultiSelectModule } from 'primeng/multiselect';
import { ServiceDetails } from '@features/sales-crm/interfaces/service-details';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { User } from '@features/auth/interfaces/sign-in/user';
@Component({
  selector: 'app-leads-add',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    DialogModule,
    MultiSelectModule,
  ],
  templateUrl: './leads-add.html',
  styleUrl: './leads-add.css',
})
export class LeadsAdd implements OnInit {
  addLeadForm: FormGroup;
  private leadsFacadeService = inject(LeadsFacadeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  isSubmitting = signal<boolean>(false);
  visible = signal<boolean>(false);
  services = signal<ServiceDetails[]>([]);
  currentUser = signal<User | null>(null);

  // Import file state
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string>('');
  isImporting = signal<boolean>(false);

  userTypes = USER_TYPES;

  // Service filter state
  private serviceFilterSubject = new Subject<string>();

  constructor(private fb: FormBuilder) {
    this.addLeadForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
            Validators.pattern(REG_EXP.NAME_PATTERN),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
            Validators.pattern(REG_EXP.NAME_PATTERN),
          ],
        ],
        eMail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        phone: ['', [Validators.required, this.phoneFormatValidator]],

        // Optional fields
        userId: [''],
        servicesOfInterest: [],
        parentId: [''],
        ssn: ['', [Validators.pattern(REG_EXP.SSN_PATTERN)]],
        currentCity: ['', Validators.maxLength(100)],
        fromCity: ['', Validators.maxLength(100)],
        dob: ['', [this.dateFormatValidator, this.pastDateValidator]],
        status: [null],
        source: [null],
        zipCode: ['', Validators.pattern(REG_EXP.ZIP_CODE_PATTERN)],
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
  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser.set(user);
    });

    // Load initial services
    this.leadsFacadeService
      .getAllServices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.services.set(response.data.items);
        },
      });

    // Setup service filter subscription with debounce
    this.serviceFilterSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((filterText) => {
        if (filterText && filterText.length > 0) {
          this.searchServices(filterText);
        } else {
          this.getAllServices();
        }
      });
  }

  searchServices(text: string) {
    this.leadsFacadeService
      .searchServices(text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.services.set(
            [...this.services(), ...response.data].filter(
              (service, index, self) => self.findIndex((t) => t.id === service.id) === index
            )
          );
        },
        error: (error) => {
          this.toastService.error(error?.error?.message || 'Failed to search services');
        },
      });
  }

  onFilterServices(event: { filter: string }) {
    // Emit to subject instead of calling directly - debounce will handle the delay
    this.serviceFilterSubject.next(event.filter || '');
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

  getAllServices() {
    this.leadsFacadeService.getAllServices().subscribe({
      next: (response) => {
        this.services.set(response.data.items);
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Failed to get services');
      },
    });
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.selectedFileName.set(file.name);
    }
  }

  importLeads() {
    const file = this.selectedFile();
    if (!file) {
      this.toastService.error('Please select a file to import');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      this.toastService.error('Invalid file type. Please upload an Excel or CSV file');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('ExcelFile', file);

    this.isImporting.set(true);

    this.leadsFacadeService.importLeads(formData).subscribe({
      next: (response) => {
        this.isImporting.set(false);
        if (response.succeeded) {
          this.toastService.success(response.message || 'Leads imported successfully');
          this.closeDialog();
          // Optionally refresh the leads table or navigate
          // this.router.navigate(['/main/sales/leads/leads-main']);
        } else {
          this.toastService.error(response.message || 'Failed to import leads');
        }
      },
      error: (error) => {
        this.isImporting.set(false);
        this.toastService.error(error?.error?.message || 'Failed to import leads');
        console.error('Import error:', error);
      },
    });
  }

  closeDialog() {
    this.visible.set(false);
    this.selectedFile.set(null);
    this.selectedFileName.set('');
  }

  private convertToFormData(formValue: any): FormData {
    const formData = new FormData();

    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'servicesOfInterest' && Array.isArray(value)) {
          // servicesOfInterest is an array of service IDs
          value.forEach((serviceId: string) => {
            formData.append('servicesOfInterest', serviceId);
          });
        } else if (Array.isArray(value)) {
          // Handle other arrays
          value.forEach((item) => {
            formData.append(key, item);
          });
        } else {
          formData.append(key, value);
        }
      }
    });

    return formData;
  }

  showDialog() {
    this.visible.set(true);
  }

  cancel() {
    window.history.back();
  }
}
