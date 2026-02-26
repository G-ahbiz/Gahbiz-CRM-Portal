import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { User } from '@features/auth/interfaces/sign-in/user';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';
import { LanguageService } from '@core/services/language.service';
import { LocationsService } from '@core/services/locations.service';
import { Country } from '@core/interfaces/country';
import { State } from '@core/interfaces/state';
import { City } from '@core/interfaces/city'; // Add City import
import { ErrorFacadeService } from '@core/services/error.facade.service';
import { SelectModule } from 'primeng/select';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';
import { SalesAgentBrief } from '@features/customers-crm/interfaces/sales-agent-brief';

@Component({
  selector: 'app-leads-add',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    DialogModule,
    MultiSelectModule,
    SelectModule,
  ],
  templateUrl: './leads-add.html',
  styleUrl: './leads-add.css',
})
export class LeadsAdd implements OnInit, OnDestroy {
  addLeadForm: FormGroup;
  private leadsFacadeService = inject(LeadsFacadeService);
  private salesAgentFacadeService = inject(SalesAgentFacadeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private translate = inject(TranslateService);
  languageService = inject(LanguageService);
  private locationService = inject(LocationsService);
  private errorFacadeService = inject(ErrorFacadeService);

  isSubmitting = signal<boolean>(false);
  visible = signal<boolean>(false);
  services = signal<ServiceDetails[]>([]);
  currentUser = signal<User | null>(null);

  // Location states
  countries = signal<Country[]>([]);
  states = signal<State[]>([]);
  cities = signal<City[]>([]); // Add cities signal
  salesAgents = signal<SalesAgentBrief[]>([]);
  loadingStates = signal<boolean>(false);
  loadingCities = signal<boolean>(false); // Add loading cities signal

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
      ssn: ['', [Validators.pattern(REG_EXP.SSN_PATTERN)]],
      currentCity: ['', Validators.maxLength(100)],
      fromCity: ['', Validators.maxLength(100)],
      dob: ['', [this.dateFormatValidator, this.pastDateValidator]],
      status: [null],
      source: [null],
      country: [null],
      state: [null],
      city: [null], // Change from text to select
      zipCode: ['', Validators.pattern(REG_EXP.ZIP_CODE_PATTERN)],
      county: ['', Validators.maxLength(100)],
      gender: ['', this.genderValidator],
      workAt: ['', Validators.maxLength(200)],
      notes: ['', Validators.maxLength(1000)],
      assignedUserId: [null],
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
        this.loadSalesAgents();
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

    // Load countries
    this.loadCountries();

    // Setup country change listener
    this.setupCountryChangeListener();

    // Setup state change listener
    this.setupStateChangeListener();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.checkViewport.bind(this));
    }
    this.serviceFilterSubject.complete();
  }

  private loadCountries(): void {
    this.locationService
      .getAllCountries$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countries) => {
          this.countries.set(countries);
        },
        error: (error) => {
          this.toastService.error(
            this.translate.instant('LEADS.ERRORS.FAILED_TO_LOAD_COUNTRIES') ||
              'Failed to load countries',
          );
        },
      });
  }

  private setupCountryChangeListener(): void {
    this.addLeadForm
      .get('country')!
      .valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(120),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (countryId) => {
          if (countryId) {
            this.loadStatesByCountryId(countryId.toString());
          } else {
            this.states.set([]);
            this.cities.set([]);
            this.addLeadForm.get('state')?.setValue(null);
            this.addLeadForm.get('city')?.setValue(null);
          }
        },
      });
  }

  private setupStateChangeListener(): void {
    this.addLeadForm
      .get('state')!
      .valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(120),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (stateId) => {
          if (stateId) {
            this.loadCitiesByStateId(stateId.toString());
          } else {
            this.cities.set([]);
            this.addLeadForm.get('city')?.setValue(null);
          }
        },
      });
  }

  private loadStatesByCountryId(countryId: string): void {
    this.loadingStates.set(true);
    this.locationService
      .getStatesByCountry$(countryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (states) => {
          this.states.set(states);
          this.loadingStates.set(false);
        },
        error: (error) => {
          this.states.set([]);
          this.loadingStates.set(false);
          this.toastService.error(
            this.translate.instant('LEADS.ERRORS.FAILED_TO_LOAD_STATES') || 'Failed to load states',
          );
        },
      });
  }

  private loadCitiesByStateId(stateId: string): void {
    this.loadingCities.set(true);
    this.locationService
      .getCitiesByState$(stateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cities) => {
          this.cities.set(cities);
          this.loadingCities.set(false);
        },
        error: (error) => {
          this.cities.set([]);
          this.loadingCities.set(false);
          this.toastService.error(
            this.translate.instant('LEADS.ERRORS.FAILED_TO_LOAD_CITIES') || 'Failed to load cities',
          );
        },
      });
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
              this.translate.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEAD_DETAILS'),
            );
            this.router.navigate(['/main/sales/leads/leads-main']);
          }
          this.isSubmitting.set(false);
        },
        error: (error) => {
          this.toastService.error(
            this.translate.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEAD_DETAILS'),
          );
          this.router.navigate(['/main/sales/leads/leads-main']);
          this.isSubmitting.set(false);
        },
      });
  }
  loadSalesAgents() {
    this.salesAgentFacadeService.getSalesAgentsDropdown().subscribe({
      next: (response) => {
        this.salesAgents.set(response.data);
      },
    });
  }

  private populateForm(lead: LeadDetails): void {
    const formattedDob = this.formatDateForInput(lead.dob);

    const serviceIds =
      lead.servicesOfInterest?.map((service) =>
        typeof service === 'string' ? service : service.id,
      ) || [];

    // First patch all basic values
    this.addLeadForm.patchValue({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      eMail: lead.email || '',
      phone: lead.phoneNumber || '',
      servicesOfInterest: serviceIds,
      ssn: lead.ssn || '',
      currentCity: lead.currentCity || '',
      fromCity: lead.fromCity || '',
      dob: formattedDob,
      status: lead.status || null,
      source: lead.sourceName || null,
      zipCode: lead.zipCode || '',
      county: lead.county || '',
      gender: lead.gender || '',
      workAt: lead.workAt || '',
      notes: '',
      assignedUserId: lead.assignedTo?.id || null,
    });

    // Handle city - check if it's a valid city name from dropdowns
    // We'll set it as text for now, then try to match with dropdowns
    this.addLeadForm.patchValue({
      city: lead.city || null,
    });

    // Now handle the cascading dropdowns
    this.setupLocationDropdowns(lead);
  }

  private setupLocationDropdowns(lead: LeadDetails): void {
    // First, load countries and then try to find matches
    this.locationService
      .getAllCountries$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countries) => {
          this.countries.set(countries);

          // Check if the lead's "country" is actually a country in our list
          const countryFound = countries.find(
            (c) =>
              c.name?.toLowerCase() === lead.country?.toLowerCase() ||
              c.shortName?.toLowerCase() === lead.country?.toLowerCase(),
          );

          if (countryFound) {
            // It's a real country, set it
            this.addLeadForm.patchValue({
              country: countryFound.id,
            });

            // Load states for this country and try to find the state
            this.locationService
              .getStatesByCountry$(countryFound.id.toString())
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (states) => {
                  this.states.set(states);

                  // Try to find state by name
                  const stateFound = states.find(
                    (s) => s.name?.toLowerCase() === lead.state?.toLowerCase(),
                  );

                  if (stateFound) {
                    this.addLeadForm.patchValue({
                      state: stateFound.id,
                    });

                    // Load cities for this state
                    this.loadCitiesForState(stateFound.id.toString(), lead.city);
                  }
                },
              });
          }
        },
      });
  }

  private loadCitiesForState(stateId: string, cityName: string): void {
    this.locationService
      .getCitiesByState$(stateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cities) => {
          this.cities.set(cities);

          // Try to find the city
          const cityFound = cities.find((c) => c.name?.toLowerCase() === cityName?.toLowerCase());

          if (cityFound) {
            this.addLeadForm.patchValue({
              city: cityFound.id,
            });
          } else {
            // City not found in dropdown, keep as text
            this.addLeadForm.patchValue({
              city: null,
            });
          }
        },
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
              (service, index, self) => self.findIndex((t) => t.id === service.id) === index,
            ),
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
      .getAllOrders()
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
    this.leadsFacadeService.getAllOrders().subscribe({
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
      country: this.translate.instant('LEADS.leads-add-page.country'),
      state: this.translate.instant('LEADS.leads-add-page.state'),
      county: this.translate.instant('LEADS.leads-add-page.county'),
      zipCode: this.translate.instant('LEADS.leads-add-page.zip-code'),
      status: this.translate.instant('LEADS.leads-add-page.status'),
      source: this.translate.instant('LEADS.leads-add-page.source'),
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

  onSsnInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(REG_EXP.SSN_PATTERN_DIGITS, '');
    input.value = digitsOnly;
    this.addLeadForm.get('ssn')?.setValue(digitsOnly, { emitEvent: false });
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
                this.translate.instant('LEADS.ERRORS.UPDATE_FAILED'),
            );
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.toastService.error(
            error?.error?.message || this.translate.instant('LEADS.ERRORS.UPDATE_FAILED'),
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
                this.translate.instant('LEADS.ERRORS.ADD_FAILED'),
            );
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.toastService.error(
            error?.error?.message || this.translate.instant('LEADS.ERRORS.ADD_FAILED'),
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
            response.message || this.translate.instant('LEADS.SUCCESS.IMPORTED'),
          );
          this.closeDialog();
        } else {
          this.toastService.error(
            response.message || this.translate.instant('LEADS.ERRORS.IMPORT_FAILED'),
          );
        }
      },
      error: (error) => {
        this.isImporting.set(false);
        this.errorFacadeService.showError(error);
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

    // 1. Get names from IDs using loose equality (==) to handle string/number mismatches
    const countryObj = this.countries().find((c) => c.id == formValue.country);
    const stateObj = this.states().find((s) => s.id == formValue.state);
    const cityObj = this.cities().find((c) => c.id == formValue.city);

    const countryName = countryObj?.name || '';
    const stateName = stateObj?.name || '';
    const cityName = cityObj?.name || '';

    Object.keys(formValue).forEach((key) => {
      let value = formValue[key];
      let targetKey = key;

      // 2. Map IDs to Names for the request
      if (key === 'country') {
        value = countryName;
      } else if (key === 'state') {
        value = stateName;
      } else if (key === 'city') {
        value = cityName;
      }

      // 3. Normalize field names for the API
      if (key === 'assignedAgentId') {
        targetKey = 'assignedUserId';
      }

      // 4. Append to FormData (Only if value exists)
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'servicesOfInterest' && Array.isArray(value)) {
          value.forEach((serviceId: string) => {
            formData.append('servicesOfInterest', serviceId);
          });
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(targetKey, item));
        } else {
          formData.append(targetKey, value);
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
