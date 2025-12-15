import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CustomersFacadeService } from '../../services/customers-facade.service';
import { CustomerDetailsResponse } from '../../interfaces/customer-details-response';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-customer-details',
  imports: [CommonModule, TranslateModule, DialogModule],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css',
})
export class CustomerDetails implements OnChanges, OnInit {
  @Input() customerId: string | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  private readonly customersFacade = inject(CustomersFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  customer = signal<CustomerDetailsResponse | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  translationsLoaded = signal<boolean>(false);

  // Translation keys for better maintainability
  readonly translationKeys = {
    CUSTOMER_INFO: 'customers-crm.customer.info.title',
    LOADING: 'COMMON.LOADING',
    CLOSE: 'COMMON.CLOSE',
    PERSONAL_DETAILS: 'customers-crm.customer.details.personal',
    ADDRESS: 'customers-crm.customer.details.address',
    FULL_NAME: 'customers-crm.customer.details.fullName',
    EMAIL: 'customers-crm.customer.details.email',
    GENDER: 'customers-crm.customer.details.gender',
    PHONE: 'customers-crm.customer.details.phone',
    NATIONAL_ID: 'customers-crm.customer.details.nationalId',
    COUNTRY: 'customers-crm.customer.details.country',
    CITY_STATE: 'customers-crm.customer.details.cityState',
    POSTAL_CODE: 'customers-crm.customer.details.postalCode',
    CLIENT: 'customers-crm.customer.details.client',
    ERROR_LOADING: 'customers-crm.customer.details.error.loading',
    ERROR_GENERIC: 'COMMON.ERRORS.GENERIC',
  };

  ngOnInit(): void {
    // Pre-load translations for this component
    this.preloadTranslations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const visibleChange = changes['visible'];
    const customerIdChange = changes['customerId'];

    // Use flags to determine if we should load
    const shouldLoad =
      (visibleChange?.currentValue === true && this.customerId) ||
      (customerIdChange?.currentValue && this.visible);

    if (shouldLoad && this.customerId) {
      this.loadCustomerDetails(this.customerId);
    }

    // Reset state when dialog closes
    if (visibleChange?.currentValue === false) {
      this.resetState();
    }
  }

  private preloadTranslations(): void {
    // Get all translation values needed for this component
    const translationValues = Object.values(this.translationKeys);

    // Use translate service to ensure translations are loaded
    this.translate.get(translationValues).subscribe({
      next: () => this.translationsLoaded.set(true),
      error: () => this.translationsLoaded.set(true), // Continue even if translations fail
    });
  }

  private loadCustomerDetails(id: string): void {
    // Prevent duplicate calls
    if (this.loading() && this.customer()?.id === id) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.customersFacade
      .getCustomerDetails(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.loading.set(false)),
        catchError((err) => {
          console.error('Error loading customer details', err);
          const errorMsg = this.translate.instant(this.translationKeys.ERROR_LOADING);
          this.error.set(errorMsg);
          this.toast.error(errorMsg);
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response?.succeeded && response.data) {
            this.customer.set(response.data);
          } else if (response) {
            const errorMsg =
              response.message || this.translate.instant(this.translationKeys.ERROR_GENERIC);
            this.error.set(errorMsg);
            this.toast.error(errorMsg);
          }
        },
      });
  }

  getFullName(): string {
    const customer = this.customer();
    if (!customer) return '';

    const parts = [];
    if (customer.firstName) parts.push(customer.firstName);
    if (customer.lastName) parts.push(customer.lastName);

    return parts.join(' ').trim();
  }

  getGenderDisplay(): string {
    const gender = this.customer()?.gender;
    if (!gender) return '';

    // Translate gender values if they exist in your translations
    const translationKey = `customers-crm.customer.gender.${gender.toLowerCase()}`;
    const translated = this.translate.instant(translationKey);

    // Fallback to original value if no translation exists
    return translated !== translationKey ? translated : gender;
  }

  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onClose.emit();
    this.resetState();
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.onClose.emit();
    this.resetState();
  }

  private resetState(): void {
    // Don't reset immediately to prevent flicker during close animation
    setTimeout(() => {
      this.customer.set(null);
      this.error.set(null);
    }, 300);
  }

  // CSS utility methods using LanguageService
  getTextAlignment(override?: 'left' | 'center' | 'right'): string {
    return this.languageService.getTextAlignmentClass(override);
  }

  getFlexDirection(reverse: boolean = false): string {
    return this.languageService.getFlexDirectionClass(reverse);
  }

  isRTL(): boolean {
    return this.languageService.isRTL();
  }
}
