import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { OrdersFacadeService } from '../../services/orders-facade.service';
import { CreateOrderRequest } from '../../interfaces/create-order-request';
import { OrderServiceData } from '../../interfaces/order-service-data';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { PaginatedServices } from '@features/sales-crm/interfaces/paginated-response';
import { ServiceDetails } from '@features/sales-crm/interfaces/service-details';
import { DialogModule } from 'primeng/dialog';

interface ServiceOption {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
}

interface PaymentMethod {
  value: string;
  label: string;
  apiValue: 'CreditCard' | 'CashOnDelivery' | 'PayPal' | 'BankTransfer';
}

interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-add-order',
  imports: [TranslateModule, DialogModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-order.html',
  styleUrl: './add-order.css',
})
export class AddOrder implements OnInit, OnDestroy {
  addOrderForm: FormGroup;
  servicesFormArray: FormArray;

  // Services
  private ordersFacade = inject(OrdersFacadeService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private leadsService = inject(LeadsFacadeService);
  private cdr = inject(ChangeDetectorRef);

  private formSubscriptions: Subscription = new Subscription();

  // States
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  createdOrderId: string | null = null;

  // Import Dialog States
  importDialogVisible = false;
  isImporting = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  importErrorMessage: string | null = null;
  importSuccessMessage: string | null = null;

  // Data for dropdowns
  readonly paymentMethods: PaymentMethod[] = [
    { value: 'credit_card', label: 'Credit Card', apiValue: 'CreditCard' },
    { value: 'cash', label: 'Cash on Delivery', apiValue: 'CashOnDelivery' },
    { value: 'paypal', label: 'PayPal', apiValue: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer', apiValue: 'BankTransfer' },
  ];

  serviceOptions: ServiceOption[] = []; // Will be populated from API
  isLoadingServices = false;
  serviceError: string | null = null;

  readonly countryCodes: CountryCode[] = [
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
  ];

  // Validation patterns
  private readonly patterns = {
    phone: /^[0-9]{10,15}$/,
    cardNumber: /^[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}$/,
    securityCode: /^[0-9]{3,4}$/,
    postalCode: /^[A-Z0-9\s-]{3,10}$/i,
  };

  constructor() {
    this.addOrderForm = this.createForm();
    this.servicesFormArray = this.addOrderForm.get('services') as FormArray;
    this.setupConditionalValidation();
  }

  ngOnInit(): void {
    this.subscribeToFormChanges();
    this.loadServices(); // Load services from API
  }

  ngOnDestroy(): void {
    this.formSubscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Customer Information - Customer ID is now required
      customerId: ['', [Validators.required, Validators.maxLength(50)]],
      firstName: [
        '',
        [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]*$/)],
      ],
      lastName: [
        '',
        [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]*$/)],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],

      // Phone
      phoneCode: ['+1', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(this.patterns.phone)]],

      // Address
      address: ['', [Validators.required, Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      postalCode: ['', [Validators.required, Validators.pattern(this.patterns.postalCode)]],
      country: ['United States', Validators.required],

      // Payment
      paymentMethod: ['', Validators.required],
      cardNumber: ['', [Validators.pattern(this.patterns.cardNumber)]],
      cardSecurityCode: ['', [Validators.pattern(this.patterns.securityCode)]],
      cardExpiry: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],

      // Services (using FormArray for multiple services)
      services: this.fb.array([this.createServiceControl()]),

      // Additional Info
      note: ['', Validators.maxLength(500)],
    });
  }

  private loadServices(): void {
    this.isLoadingServices = true;
    this.serviceError = null;

    this.leadsService.getAllServices().subscribe({
      next: (response: ApiResponse<PaginatedServices>) => {
        if (response?.succeeded && response.data?.items) {
          // Map ServiceDetails to ServiceOption format
          this.serviceOptions = response.data.items
            .filter((service) => service.active)
            .map((service: ServiceDetails) => ({
              id: service.id,
              name: service.name,
              description: service.description,
              price: service.price,
              currency: service.currency,
            }));
        } else {
          this.serviceError = 'Failed to load services';
          this.serviceOptions = this.getDefaultServiceOptions();
        }
        this.isLoadingServices = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load services:', error);
        this.serviceError = 'Failed to load services. Please try again.';
        this.serviceOptions = this.getDefaultServiceOptions();
        this.isLoadingServices = false;
        this.cdr.detectChanges();
      },
    });
  }

  private getDefaultServiceOptions(): ServiceOption[] {
    return [
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Consultation' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', name: 'Maintenance' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', name: 'Installation' },
    ];
  }

  private createServiceControl(): FormGroup {
    return this.fb.group({
      serviceId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
    });
  }

  addService(): void {
    this.servicesFormArray.push(this.createServiceControl());
  }

  removeService(index: number): void {
    if (this.servicesFormArray.length > 1) {
      this.servicesFormArray.removeAt(index);
    }
  }

  get servicesControls() {
    return (this.addOrderForm.get('services') as FormArray).controls;
  }

  private setupConditionalValidation(): void {
    const cardControls = ['cardNumber', 'cardSecurityCode', 'cardExpiry'];

    this.formSubscriptions.add(
      this.addOrderForm.get('paymentMethod')?.valueChanges.subscribe((method: string) => {
        cardControls.forEach((controlName) => {
          const control = this.addOrderForm.get(controlName);
          if (method === 'credit_card') {
            const validators = [Validators.required];
            if (controlName === 'cardNumber')
              validators.push(Validators.pattern(this.patterns.cardNumber));
            if (controlName === 'cardSecurityCode')
              validators.push(Validators.pattern(this.patterns.securityCode));
            if (controlName === 'cardExpiry')
              validators.push(Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/));
            control?.setValidators(validators);
          } else {
            control?.clearValidators();
            control?.setValue(''); // Clear values when not needed
          }
          control?.updateValueAndValidity();
        });
      }) ?? new Subscription()
    );
  }

  private subscribeToFormChanges(): void {
    // Auto-format card number
    this.formSubscriptions.add(
      this.addOrderForm.get('cardNumber')?.valueChanges.subscribe((value) => {
        if (value) {
          const formatted = value
            .replace(/\s/g, '')
            .replace(/(\d{4})/g, '$1 ')
            .trim();
          if (formatted !== value) {
            this.addOrderForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
          }
        }
      }) ?? new Subscription()
    );

    // Auto-format expiry date
    this.formSubscriptions.add(
      this.addOrderForm.get('cardExpiry')?.valueChanges.subscribe((value) => {
        if (value) {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length >= 2) {
            const month = cleaned.slice(0, 2);
            const year = cleaned.slice(2, 4);
            const formatted = `${month}/${year}`;
            if (formatted !== value) {
              this.addOrderForm.get('cardExpiry')?.setValue(formatted, { emitEvent: false });
            }
          }
        }
      }) ?? new Subscription()
    );
  }

  get paymentMethodValue(): string {
    return this.addOrderForm.get('paymentMethod')?.value || 'credit_card';
  }

  get fullPhoneNumber(): string {
    const code = this.addOrderForm.get('phoneCode')?.value || '';
    const number = this.addOrderForm.get('phone')?.value || '';
    return `${code}${number}`;
  }

  getFormControl(controlName: string) {
    return this.addOrderForm.get(controlName);
  }

  setPaymentMethod(method: string): void {
    if (this.paymentMethods.some((pm) => pm.value === method)) {
      this.addOrderForm.patchValue({ paymentMethod: method });
    }
  }

  updateQuantity(change: number, index: number): void {
    const servicesArray = this.addOrderForm.get('services') as FormArray;
    const serviceGroup = servicesArray.at(index) as FormGroup;
    const quantityControl = serviceGroup.get('quantity');

    if (quantityControl) {
      const currentQty = quantityControl.value || 0;
      const newQty = Math.max(1, currentQty + change);
      quantityControl.setValue(newQty);
    }
  }

  goBack(): void {
    if (this.createdOrderId) {
      this.router.navigate(['/orders', this.createdOrderId]);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.addOrderForm.invalid) {
      this.addOrderForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    this.isSubmitting = true;

    const formData = this.prepareSubmitData();

    this.ordersFacade
      .createOrder(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (orderId) => {
          this.successMessage = 'Order created successfully!';
          this.createdOrderId = orderId;

          // Auto-redirect after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/orders', orderId]);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to create order. Please try again.';
        },
      });
  }

  private prepareSubmitData(): CreateOrderRequest {
    const formValue = this.addOrderForm.value;
    const paymentMethod = this.paymentMethods.find((pm) => pm.value === formValue.paymentMethod);

    // Map services to the required format
    const services: OrderServiceData[] = formValue.services
      .filter((service: any) => service.serviceId) // Filter out empty services
      .map((service: any) => ({
        serviceId: service.serviceId,
        quantity: service.quantity,
      }));

    return {
      customerId: formValue.customerId.trim(), // Customer ID is now required
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim().toLowerCase(),
      phone: this.fullPhoneNumber,
      address: formValue.address.trim(),
      postalCode: formValue.postalCode.trim(),
      country: formValue.country,
      state: formValue.state.trim(),
      city: formValue.city.trim(),
      paymentMethod: paymentMethod?.apiValue || 'CreditCard',
      services: services,
      note: formValue.note?.trim() || undefined,
    };
  }

  private scrollToFirstInvalidControl(): void {
    const firstInvalidControl = document.querySelector('.ng-invalid');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      (firstInvalidControl as HTMLElement).focus();
    }
  }

  resetForm(): void {
    if (this.addOrderForm.dirty && !this.isSubmitting) {
      if (confirm('Are you sure you want to reset the form? All changes will be lost.')) {
        this.addOrderForm.reset({
          phoneCode: '+1',
          country: 'United States',
          paymentMethod: 'credit_card',
          services: [{ serviceId: '', quantity: 1 }],
        });
        this.errorMessage = null;
        this.successMessage = null;
        this.createdOrderId = null;
      }
    }
  }

  // Helper method to get selected service name
  getServiceName(serviceId: string): string {
    const service = this.serviceOptions.find((s) => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  }

  // Helper to get service price with currency
  getServicePrice(serviceId: string): string {
    const service = this.serviceOptions.find((s) => s.id === serviceId);
    if (service && service.price && service.currency) {
      return `${service.price} ${service.currency}`;
    }
    return '';
  }

  getServiceDescription(serviceId: string): string {
    const service = this.serviceOptions.find((s) => s.id === serviceId);
    return service?.description || '';
  }

  // Import Dialog Methods
  showImportDialog(): void {
    this.importDialogVisible = true;
    this.resetImportState();
  }

  closeImportDialog(): void {
    this.importDialogVisible = false;
    this.resetImportState();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        this.importErrorMessage =
          'Invalid file type. Please select an Excel file (.xlsx, .xls, .csv).';
        this.selectedFile = null;
        this.selectedFileName = null;
        return;
      }

      // Validate file size (e.g., 10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.importErrorMessage = 'File size exceeds 10MB limit.';
        this.selectedFile = null;
        this.selectedFileName = null;
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.importErrorMessage = null;
      this.importSuccessMessage = null;
    }
  }

  importOrders(): void {
    if (!this.selectedFile) {
      this.importErrorMessage = 'Please select a file to import.';
      return;
    }

    this.isImporting = true;
    this.importErrorMessage = null;
    this.importSuccessMessage = null;

    this.ordersFacade
      .importOrder(this.selectedFile)
      .pipe(
        finalize(() => {
          this.isImporting = false;
        })
      )
      .subscribe({
        next: (response: ApiResponse<any>) => {
          if (response?.succeeded) {
            this.importSuccessMessage = response.message || 'Orders imported successfully!';

            // Reset file input
            this.selectedFile = null;
            this.selectedFileName = null;

            // Close dialog after 2 seconds and redirect
            setTimeout(() => {
              this.closeImportDialog();
              this.router.navigate(['/orders']);
            }, 2000);
          } else {
            this.importErrorMessage = response?.message || 'Failed to import orders.';
          }
        },
        error: (error) => {
          this.importErrorMessage =
            error.message || 'An error occurred during import. Please try again.';
        },
      });
  }

  private resetImportState(): void {
    this.selectedFile = null;
    this.selectedFileName = null;
    this.importErrorMessage = null;
    this.importSuccessMessage = null;
    this.isImporting = false;
  }

  // Helper to get file size in readable format
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
