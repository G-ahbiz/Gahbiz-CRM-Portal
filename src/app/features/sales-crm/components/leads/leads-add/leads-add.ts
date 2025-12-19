import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { ToastService } from '@core/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { REG_EXP, USER_TYPES } from '@shared/config/constants';
import { MultiSelectModule } from 'primeng/multiselect';
import { ServiceDetails } from '@features/sales-crm/interfaces/service-details';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { User } from '@features/auth/interfaces/sign-in/user';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';
import { LanguageService } from '@core/services/language.service';

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
export class LeadsAdd implements OnInit, OnDestroy {
  addLeadForm: FormGroup;
  private leadsFacadeService = inject(LeadsFacadeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private translate = inject(TranslateService);
  languageService = inject(LanguageService);

  isSubmitting = signal<boolean>(false);
  visible = signal<boolean>(false);
  services = signal<ServiceDetails[]>([]);
  currentUser = signal<User | null>(null);

  isEditMode = signal<boolean>(false);
  leadId = signal<string | null>(null);

  // Import file state
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string>('');
  isImporting = signal<boolean>(false);

  userTypes = USER_TYPES;

  // Responsive layout
  private isMobile = signal<boolean>(false);
  private isTablet = signal<boolean>(false);

  // Computed properties for responsive design
  formRowClass = computed(() => {
    return this.isMobile() ? 'flex-column' : 'flex-row';
  });

  formGroupClass = computed(() => {
    return this.isMobile() ? 'w-100 mb-3' : 'w-50';
  });

  buttonContainerClass = computed(() => {
    return this.isMobile() ? 'flex-column' : 'flex-row';
  });

  buttonClass = computed(() => {
    return this.isMobile() ? 'w-100 mb-2' : 'flex-grow-1';
  });

  textAlignmentClass = computed(() => {
    return this.languageService.getTextAlignmentClass();
  });

  flexDirectionClass = computed(() => {
    return this.languageService.getFlexDirectionClass();
  });

  getLabelAlignmentClass(): string {
    return this.languageService.isRTL()
      ? 'flex-row-reverse justify-content-end'
      : 'flex-row justify-content-start';
  }

  // Service filter state
  private serviceFilterSubject = new Subject<string>();

  constructor(private fb: FormBuilder) {
    this.addLeadForm = this.fb.group({
      firstName: [
        '',
        [Validators.required, Validators.maxLength(100), Validators.pattern(REG_EXP.NAME_PATTERN)],
      ],
      lastName: [
        '',
        [Validators.required, Validators.maxLength(100), Validators.pattern(REG_EXP.NAME_PATTERN)],
      ],
      eMail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, this.phoneFormatValidator]],

      // Optional fields
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
      notes: ['', Validators.maxLength(1000)],
    });
  }

  ngOnInit(): void {
    this.initializeResponsiveLayout();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.leadId.set(id);
        this.loadLeadData(id);
      }
    });

    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser.set(user);
    });

    // Load initial services
    this.loadAllServices();

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

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.checkViewport.bind(this));
    }
    this.serviceFilterSubject.complete();
  }

  private initializeResponsiveLayout(): void {
    if (typeof window !== 'undefined') {
      this.checkViewport();
      window.addEventListener('resize', this.checkViewport.bind(this));
    }
  }

  private checkViewport(): void {
    const width = window.innerWidth;
    this.isMobile.set(width < 768);
    this.isTablet.set(width >= 768 && width < 992);
  }

  private loadLeadData(leadId: string): void {
    this.isSubmitting.set(true);
    this.leadsFacadeService
      .getLeadById(leadId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.populateForm(response.data);
          } else {
            this.toastService.error(
              this.translate.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEAD_DETAILS')
            );
            this.router.navigate(['/main/sales/leads/leads-main']);
          }
          this.isSubmitting.set(false);
        },
        error: (error) => {
          this.toastService.error(
            this.translate.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEAD_DETAILS')
          );
          this.router.navigate(['/main/sales/leads/leads-main']);
          this.isSubmitting.set(false);
        },
      });
  }

  private populateForm(lead: LeadDetails): void {
    const formattedDob = this.formatDateForInput(lead.dob);

    const serviceIds =
      lead.servicesOfInterest?.map((service) =>
        typeof service === 'string' ? service : service.id
      ) || [];

    this.addLeadForm.patchValue({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      eMail: lead.email || '',
      phone: lead.phoneNumber || '',
      servicesOfInterest: serviceIds,
      parentId: lead.parentId || '',
      ssn: lead.ssn || '',
      currentCity: lead.currentCity || '',
      fromCity: lead.fromCity || '',
      dob: formattedDob,
      status: lead.status || null,
      source: lead.sourceName || null,
      zipCode: lead.zipCode || '',
      city: lead.city || '',
      state: lead.state || '',
      county: lead.county || '',
      gender: lead.gender || '',
      workAt: lead.workAt || '',
      notes: '',
    });
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Format as YYYY-MM-DD for input[type="date"]
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
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

  loadAllServices() {
    this.leadsFacadeService
      .getAllServices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.services.set(response.data.items || []);
        },
        error: (error) => {
          this.toastService.error(error?.error?.message || 'Failed to get services');
        },
      });
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

    if (errors['required'])
      return this.translate.instant('LEADS.leads-add-page.required-field', {
        field: this.getFieldLabel(fieldName),
      });
    if (errors['maxlength'])
      return this.translate.instant('LEADS.leads-add-page.max-length-error', {
        field: this.getFieldLabel(fieldName),
        max: errors['maxlength'].requiredLength,
      });
    if (errors['pattern']) return this.getPatternError(fieldName);
    if (errors['email']) return this.translate.instant('LEADS.leads-add-page.invalid-email');
    if (errors['invalidDateFormat'])
      return this.translate.instant('LEADS.leads-add-page.invalid-date-format');
    if (errors['futureDate'])
      return this.translate.instant('LEADS.leads-add-page.future-date-error');
    if (errors['invalidGender'])
      return this.translate.instant('LEADS.leads-add-page.invalid-gender');
    if (errors['invalidUSPhone'] || errors['invalidPhone'])
      return this.translate.instant('LEADS.leads-add-page.invalid-phone');
    if (errors['invalidGuid']) return this.translate.instant('LEADS.leads-add-page.invalid-guid');

    return this.translate.instant('COMMON.ERROR');
  }

  private getFieldLabel(fieldName: string): string {
    const fieldLabels: { [key: string]: string } = {
      firstName: this.translate.instant('LEADS.leads-add-page.first-name'),
      lastName: this.translate.instant('LEADS.leads-add-page.last-name'),
      eMail: this.translate.instant('LEADS.leads-add-page.email'),
      phone: this.translate.instant('LEADS.leads-add-page.phone'),
      ssn: this.translate.instant('LEADS.leads-add-page.ssn'),
      dob: this.translate.instant('LEADS.leads-add-page.dob'),
      gender: this.translate.instant('LEADS.leads-add-page.gender'),
      city: this.translate.instant('LEADS.leads-add-page.city'),
      state: this.translate.instant('LEADS.leads-add-page.state'),
      county: this.translate.instant('LEADS.leads-add-page.county'),
      zipCode: this.translate.instant('LEADS.leads-add-page.zip-code'),
      status: this.translate.instant('LEADS.leads-add-page.status'),
      source: this.translate.instant('LEADS.leads-add-page.source'),
      parentId: this.translate.instant('LEADS.leads-add-page.parent-id'),
      workAt: this.translate.instant('LEADS.leads-add-page.work-at'),
      currentCity: this.translate.instant('LEADS.leads-add-page.current-city'),
      fromCity: this.translate.instant('LEADS.leads-add-page.from-city'),
      notes: this.translate.instant('LEADS.leads-add-page.notes'),
    };

    return fieldLabels[fieldName] || fieldName;
  }

  private getPatternError(fieldName: string): string {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return this.translate.instant('LEADS.leads-add-page.name-pattern-error');
      case 'phone':
        return this.translate.instant('LEADS.leads-add-page.phone-pattern-error');
      case 'ssn':
        return this.translate.instant('LEADS.leads-add-page.ssn-pattern-error');
      case 'zipCode':
        return this.translate.instant('LEADS.leads-add-page.zip-code-pattern-error');
      default:
        return this.translate.instant('LEADS.leads-add-page.invalid-format');
    }
  }

  checkValidity(control: string) {
    const formControl = this.addLeadForm.get(control);
    return formControl?.valid && !formControl?.errors?.['required']
      ? 'text-success'
      : 'text-danger';
  }

  checkErrors(control: string) {
    const formControl = this.addLeadForm.get(control);
    return formControl?.errors && formControl?.touched;
  }

  back() {
    window.history.back();
  }

  saveLead() {
    if (this.addLeadForm.invalid) {
      this.addLeadForm.markAllAsTouched();
      this.toastService.error(this.translate.instant('LEADS.leads-add-page.fill-required-fields'));
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.convertToFormData(this.addLeadForm.value);

    if (this.isEditMode() && this.leadId()) {
      // Update existing lead
      this.leadsFacadeService.updateLead(this.leadId()!, formData as any).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.succeeded) {
            this.toastService.success(this.translate.instant('LEADS.SUCCESS.UPDATED'));
            this.router.navigate(['/main/sales/leads/leads-main']);
          } else {
            this.toastService.error(
              response.errors?.[0] ||
                response.message ||
                this.translate.instant('LEADS.ERRORS.UPDATE_FAILED')
            );
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.toastService.error(
            error?.error?.message || this.translate.instant('LEADS.ERRORS.UPDATE_FAILED')
          );
        },
      });
    } else {
      // Create new lead
      this.leadsFacadeService.addLead(formData as any).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.succeeded) {
            this.toastService.success(this.translate.instant('LEADS.SUCCESS.ADDED'));
            this.router.navigate(['/main/sales/leads/leads-main']);
          } else {
            this.toastService.error(
              response.errors?.[0] ||
                response.message ||
                this.translate.instant('LEADS.ERRORS.ADD_FAILED')
            );
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.toastService.error(
            error?.error?.message || this.translate.instant('LEADS.ERRORS.ADD_FAILED')
          );
        },
      });
    }
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
      this.toastService.error(this.translate.instant('LEADS.import-dialog.select-file-error'));
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      this.toastService.error(this.translate.instant('LEADS.import-dialog.invalid-file-type'));
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
          this.toastService.success(
            response.message || this.translate.instant('LEADS.SUCCESS.IMPORTED')
          );
          this.closeDialog();
        } else {
          this.toastService.error(
            response.message || this.translate.instant('LEADS.ERRORS.IMPORT_FAILED')
          );
        }
      },
      error: (error) => {
        this.isImporting.set(false);
        this.toastService.error(
          error?.error?.message || this.translate.instant('LEADS.ERRORS.IMPORT_FAILED')
        );
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

  getPageTitle(): string {
    return this.isEditMode() ? 'Edit Lead' : 'Add Lead';
  }

  getMarginClass(side: 'start' | 'end' | 'top' | 'bottom', size: string = ''): string {
    return this.languageService.getMarginClass(side, size);
  }

  getPaddingClass(side: 'start' | 'end' | 'top' | 'bottom', size: string = ''): string {
    return this.languageService.getPaddingClass(side, size);
  }

  getFloatClass(side: 'start' | 'end'): string {
    return this.languageService.getFloatClass(side);
  }

  getFlexDirection(reverse: boolean = false): string {
    return this.languageService.getFlexDirectionClass(reverse);
  }
}
