import { Component, DestroyRef, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomersFacadeService } from '../../services/customers-facade.service';
import { AuthService } from '@core/services/auth.service';
import { GetSalesAgentsResponse } from '../../interfaces/get-sales-agents-response';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GENDERS, LANGUAGES, ROUTES, USER_TYPES } from '@shared/config/constants';
import { AddCustomerRequest } from '../../interfaces/add-customer-request';
import { UpdateCustomerRequest } from '../../interfaces/update-customer-request';
import { ToastService } from '@core/services/toast.service';
import { ErrorFacadeService } from '@core/services/error.facade.service';
import { CustomerDetailsResponse } from '../../interfaces/customer-details-response';
import { LanguageService } from '@core/services/language.service';
import { LocationsService } from '@core/services/locations.service';
import { TableModule } from 'primeng/table';
import { distinctUntilChanged, filter, debounceTime, tap, switchMap, Observable } from 'rxjs';
import { Country } from '@core/interfaces/country';
import { State } from '@core/interfaces/state';

@Component({
  selector: 'app-add-customers',
  imports: [TranslateModule, CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: './add-customers.html',
  styleUrl: './add-customers.css',
})
export class AddCustomers implements OnInit, OnDestroy {
  languageService = inject(LanguageService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private customersFacadeService = inject(CustomersFacadeService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private errorFacadeService = inject(ErrorFacadeService);
  private locationService = inject(LocationsService);

  addCustomerForm: FormGroup;
  salesAgents = signal<GetSalesAgentsResponse[]>([]);
  countries = signal<Country[]>([]); // Changed from countries$ to countries signal
  states = signal<State[]>([]);
  loading = signal<boolean>(false);
  loadingStates = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  customerId = signal<string | null>(null);
  USER_TYPES = USER_TYPES;

  private pendingStateNameOrId: string | null = null;

  languages = [
    { code: 'English', label: 'LANGUAGES.ENGLISH' },
    { code: 'Arabic', label: 'LANGUAGES.ARABIC' },
    { code: 'Spanish', label: 'LANGUAGES.SPANISH' },
  ];

  genders = [
    { value: 'male', label: 'CUSTOMERS-CRM.add-customer-page.male' },
    { value: 'female', label: 'CUSTOMERS-CRM.add-customer-page.female' },
    { value: 'other', label: 'CUSTOMERS-CRM.add-customer-page.other' },
    { value: 'prefer not to say', label: 'CUSTOMERS-CRM.add-customer-page.prefer-not-to-say' },
  ];

  currentUser$ = this.authService.currentUser$;

  private isMobile = signal<boolean>(false);
  private isTablet = signal<boolean>(false);

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

  constructor() {
    const id = this.route.snapshot.params['id'];
    const isEdit = !!id;
    this.isEditMode.set(isEdit);
    if (isEdit) this.customerId.set(id);

    this.addCustomerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
      ssn: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(14)]],
      gender: ['', [Validators.required]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      defaultLanguage: [{ value: '', disabled: isEdit }, [Validators.required]],
      assignedAgentId: [{ value: '', disabled: isEdit }, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.initializeResponsiveLayout();

    this.loadCountries().subscribe({
      next: () => {
        const id = this.route.snapshot.params['id'];
        if (id) {
          this.customerId.set(id);
          this.loadCustomerDetails(id);
        }
      },
      error: (error) => {
        const errorMsg = this.errorFacadeService.handleHttpError(error);
        this.toast.error(errorMsg);
      },
    });

    // Set up country change listener
    this.setupCountryChangeListener();

    // Handle user permissions
    this.setupUserPermissions();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.checkViewport.bind(this));
    }
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

  loadCountries(): Observable<Country[]> {
    return this.locationService.getAllCountries$().pipe(
      takeUntilDestroyed(this.destroyRef),
      tap({
        next: (countries) => {
          this.countries.set(countries);
          console.log('Countries loaded:', countries.length);
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
        },
      })
    );
  }

  private setupCountryChangeListener(): void {
    this.addCustomerForm
      .get('country')!
      .valueChanges.pipe(
        distinctUntilChanged(),
        filter((val) => !!val),
        debounceTime(120),
        tap(() => {
          this.loadingStates.set(true);
          this.states.set([]);
        }),
        switchMap((countryId: number) =>
          this.locationService.getStatesByCountry$(countryId.toString())
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (states) => {
          this.loadingStates.set(false);
          this.states.set(states || []);
        },
        error: (err) => {
          this.loadingStates.set(false);
          this.states.set([]);
          const errorMsg = this.errorFacadeService.handleHttpError(err);
          this.toast.error(errorMsg);
        },
      });
  }

  private setupUserPermissions(): void {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      if (!user) return;
      if (user.type !== USER_TYPES.ADMIN && user.type !== USER_TYPES.MANAGER) {
        this.addCustomerForm.get('assignedAgentId')?.setValue(user.id);
      } else {
        this.getSalesAgents();
      }
    });
  }

  onCountryChange(countryId: string): void {
    this.addCustomerForm.get('state')?.setValue('');
    this.states.set([]);
    if (!countryId) return;
    this.loadStatesByCountryId(countryId);
  }

  loadStatesByCountryId(countryId: string): void {
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
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          this.loadingStates.set(false);
        },
      });
  }

  loadCustomerDetails(id: string) {
    this.loading.set(true);
    this.customersFacadeService
      .getCustomerDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.populateForm(response.data);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          }
          this.loading.set(false);
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          this.loading.set(false);
        },
      });
  }

  populateForm(customer: CustomerDetailsResponse) {
    console.log('Populating form with customer:', customer);
    console.log('Current countries:', this.countries());

    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const normalizedGender = customer.gender?.toLowerCase() ?? '';

    // Set basic values first
    this.addCustomerForm.patchValue({
      fullName: fullName,
      email: customer.eMail,
      phone: customer.phone,
      ssn: customer.ssn,
      gender: normalizedGender,
      postalCode: customer.postalCode,
      address: customer.address,
    });

    // Find country by name or shortName
    const country = this.countries().find(
      (c) => c.name === customer.country || c.shortName === customer.country
    );

    console.log('Found country:', country);
    console.log('Customer country name:', customer.country);

    if (country) {
      console.log('Setting country ID:', country.id);
      this.addCustomerForm.patchValue({
        country: country.id,
      });

      this.locationService
        .getStatesByCountry$(country.id.toString())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (states) => {
            console.log('States loaded for country:', states);
            this.states.set(states);

            const state = states.find((s) => s.name === customer.state);
            if (state) {
              console.log('Found state by name:', state);
              this.addCustomerForm.patchValue({
                state: state.id,
              });
            } else {
              const stateById = states.find((s) => this.compareIds(s.id, customer.state));
              if (stateById) {
                console.log('Found state by ID:', stateById);
                this.addCustomerForm.patchValue({
                  state: stateById.id,
                });
              } else {
                console.log('State not found:', customer.state);
              }
            }
          },
          error: (error) => {
            console.error('Failed to load states:', error);
          },
        });
    } else {
      console.log('Country not found in list. Customer country:', customer.country);
      this.pendingStateNameOrId = customer.state;
    }
  }

  goBack() {
    window.history.back();
  }

  checkValidity(control: string): string {
    return this.addCustomerForm.get(control)?.valid &&
      !this.addCustomerForm.get(control)?.errors?.['required']
      ? 'text-success'
      : 'text-danger';
  }

  save() {
    this.loading.set(true);
    if (this.addCustomerForm.invalid) {
      Object.keys(this.addCustomerForm.controls).forEach((key) => {
        const control = this.addCustomerForm.get(key);
        if (control?.enabled) {
          control.markAsTouched();
        }
      });
      this.loading.set(false);
      this.toast.error(this.translateService.instant('VALIDATION.FILL_REQUIRED_FIELDS'));
      return;
    }

    if (this.isEditMode() && this.customerId()) {
      this.updateCustomer();
    } else {
      this.addCustomer();
    }
  }

  addCustomer() {
    const formValue = this.addCustomerForm.value;
    const formData = new FormData();

    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      formData.append(key, value);
    });

    this.customersFacadeService
      .addCustomer(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toast.success(
              this.translateService.instant('CUSTOMERS-CRM.add-customer-page.success.add')
            );
            this.router.navigate([ROUTES.customersTable]);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          }
          this.loading.set(false);
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          this.loading.set(false);
        },
      });
  }

  updateCustomer() {
    const countryId = this.addCustomerForm.get('country')?.value;
    const stateId = this.addCustomerForm.get('state')?.value;

    // Convert to numbers for comparison since IDs are numbers
    const countryIdNum = Number(countryId);
    const stateIdNum = Number(stateId);

    // Find country - compare as numbers
    const country = this.countries().find((c) => Number(c.id) === countryIdNum);

    // Find state - compare as numbers
    const state = this.states().find((s) => Number(s.id) === stateIdNum);

    console.log('Country ID:', countryId, 'as number:', countryIdNum);
    console.log('State ID:', stateId, 'as number:', stateIdNum);
    console.log('Countries list:', this.countries());
    console.log('States list:', this.states());
    console.log('Found country:', country);
    console.log('Found state:', state);

    const updateData: UpdateCustomerRequest = {
      fullName: this.addCustomerForm.get('fullName')?.value,
      email: this.addCustomerForm.get('email')?.value,
      phone: this.addCustomerForm.get('phone')?.value,
      gender: this.addCustomerForm.get('gender')?.value,
      country: country?.name || '',
      state: state?.name || '',
      postalCode: this.addCustomerForm.get('postalCode')?.value,
      address: this.addCustomerForm.get('address')?.value,
      ssn: this.addCustomerForm.get('ssn')?.value,
    };

    console.log('Sending update data:', updateData);

    this.customersFacadeService
      .updateCustomer(this.customerId()!, updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toast.success(
              this.translateService.instant('CUSTOMERS-CRM.edit-customer-page.success.update')
            );
            this.router.navigate([ROUTES.customersTable]);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          }
          this.loading.set(false);
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          this.loading.set(false);
        },
      });
  }

  getStateNameByIdOrName(stateValue: string): string {
    const stateById = this.states().find((s) => s.id === stateValue);
    if (stateById) return stateById.name;

    const stateByName = this.states().find((s) => s.name === stateValue);
    if (stateByName) return stateByName.name;

    return stateValue;
  }

  cancel() {
    window.history.back();
  }

  getSalesAgents() {
    this.customersFacadeService
      .getSalesAgents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.salesAgents.set(Array.isArray(response.data) ? response.data : []);
          } else {
            this.salesAgents.set([]);
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
          }
        },
        error: (error) => {
          this.salesAgents.set([]);
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(this.translateService.instant(errorMsg) || errorMsg);
        },
      });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.addCustomerForm.get(fieldName);
    if (!control || !control.errors || !control.enabled) return '';

    const errors = control.errors;

    const fieldTranslationKeys: { [key: string]: string } = {
      fullName: 'CUSTOMERS-CRM.add-customer-page.full-name',
      email: 'CUSTOMERS-CRM.add-customer-page.email',
      phone: 'CUSTOMERS-CRM.add-customer-page.phone',
      ssn: 'CUSTOMERS-CRM.add-customer-page.ssn',
      gender: 'CUSTOMERS-CRM.add-customer-page.gender',
      country: 'CUSTOMERS-CRM.add-customer-page.country',
      state: 'CUSTOMERS-CRM.add-customer-page.state',
      postalCode: 'CUSTOMERS-CRM.add-customer-page.postal-code',
      address: 'CUSTOMERS-CRM.add-customer-page.address',
      defaultLanguage: 'CUSTOMERS-CRM.add-customer-page.default-language',
      assignedAgentId: 'CUSTOMERS-CRM.add-customer-page.assign-user',
    };

    const translationKey = fieldTranslationKeys[fieldName] || fieldName;
    const fieldNameTranslated = this.translateService.instant(translationKey);

    if (errors['required']) {
      return this.translateService.instant('VALIDATION.REQUIRED', { field: fieldNameTranslated });
    }

    if (errors['email']) {
      return this.translateService.instant('VALIDATION.EMAIL');
    }

    if (errors['minlength']) {
      return this.translateService.instant('VALIDATION.MIN_LENGTH', {
        field: fieldNameTranslated,
        min: errors['minlength'].requiredLength,
      });
    }

    if (errors['maxlength']) {
      return this.translateService.instant('VALIDATION.MAX_LENGTH', {
        field: fieldNameTranslated,
        max: errors['maxlength'].requiredLength,
      });
    }

    return this.translateService.instant('VALIDATION.INVALID', { field: fieldNameTranslated });
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

  private compareIds(id1: unknown, id2: unknown): boolean {
    return String(id1) === String(id2);
  }
}
