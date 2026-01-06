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
import { CustomersFacadeService } from '@features/customers-crm/services/customers-facade.service';
import { GetCustomersResponse } from '@features/customers-crm/interfaces/get-customers-response';
import { InputComponent } from '@shared/components/input/input.component';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetCustomersFilters } from '@features/customers-crm/interfaces/get-customers-filters';
import { ToastService } from '@core/services/toast.service';

interface ServiceOption {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
}

interface CustomerOption {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
}

interface PaymentMethod {
  value: string;
  label: string;
  apiValue: 'CreditCard' | 'CashOnDelivery' | 'PayPal' | 'BankTransfer';
}

@Component({
  selector: 'app-add-order',
  imports: [TranslateModule, DialogModule, InputComponent, ReactiveFormsModule, CommonModule],
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
  private customersFacade = inject(CustomersFacadeService);
  private toastService = inject(ToastService);

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
    { value: 'cash', label: 'Cash on Delivery', apiValue: 'CashOnDelivery' },
  ];

  serviceOptions: ServiceOption[] = []; // Will be populated from API
  isLoadingServices = false;
  serviceError: string | null = null;
  customerOptions: CustomerOption[] = []; // New property for customer options
  isLoadingCustomers = false; // New loading state for customers
  customerError: string | null = null;

  private readonly patterns = {
    phone: /^(?=.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d)[\d\s\-\(\)]{10,20}$/,
    postalCode: /^[A-Z0-9\s-]{3,10}$/i,
  };

  constructor() {
    this.addOrderForm = this.createForm();
    this.servicesFormArray = this.addOrderForm.get('services') as FormArray;
  }

  ngOnInit(): void {
    this.subscribeToFormChanges();
    this.loadServices();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.formSubscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      customerId: ['', Validators.required],
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
      phone: ['', [Validators.required, this.phoneValidator.bind(this)]],

      // Address
      address: ['', [Validators.required, Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      postalCode: ['', [Validators.required, Validators.pattern(this.patterns.postalCode)]],
      country: ['United States', Validators.required],

      // Payment
      paymentMethod: ['cash', Validators.required],

      // Services (using FormArray for multiple services)
      services: this.fb.array([this.createServiceControl()]),

      // Additional Info
      note: ['', Validators.maxLength(500)],
    });
  }

  private phoneValidator(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const digitsOnly = control.value.replace(/\D/g, '');

    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      return null;
    }

    return { phone: true };
  }

  private loadServices(): void {
    this.isLoadingServices = true;
    this.serviceError = null;

    this.leadsService.getAllOrders().subscribe({
      next: (response: ApiResponse<PaginatedServices>) => {
        if (response?.succeeded && response.data?.items) {
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
          this.toastService.error('Failed to load services. Please try again.');
        }
        this.isLoadingServices = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load services:', error);
        this.serviceError = 'Failed to load services. Please try again.';
        this.toastService.error('Failed to load services. Please try again.');
        this.isLoadingServices = false;
        this.cdr.detectChanges();
      },
    });
  }

  getCustomerName(customerId: string): string {
    const customer = this.customerOptions.find((c) => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  }

  private loadCustomers(): void {
    this.isLoadingCustomers = true;
    this.customerError = null;

    const filters: GetCustomersFilters = {
      pageNumber: 1,
      pageSize: 1000000000,
      sortColumn: '',
      sortDirection: 'ASC',
    };

    this.customersFacade.getAllCustomers(filters).subscribe({
      next: (response: PagenatedResponse<GetCustomersResponse>) => {
        if (response?.items) {
          this.customerOptions = response.items.map((customer: GetCustomersResponse) => {
            const { firstName, lastName } = this.parseFullName(customer.fullName);

            return {
              id: customer.id,
              name: customer.fullName || 'Unknown Customer',
              firstName: firstName,
              lastName: lastName,
            };
          });
        } else {
          this.customerError = 'No customers found';
          this.customerOptions = [];
        }
        this.isLoadingCustomers = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load customers:', error);
        this.customerError = 'Failed to load customers. Please try again.';
        this.customerOptions = [];
        this.toastService.error('Failed to load customers. Please try again.');
        this.isLoadingCustomers = false;
        this.cdr.detectChanges();
      },
    });
  }

  private parseFullName(fullName: string): { firstName: string; lastName: string } {
    if (!fullName) return { firstName: '', lastName: '' };

    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }

    // For names with 2+ parts, take first word as first name, rest as last name
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  // Add this method to handle customer selection
  onCustomerSelect(event: any): void {
    const customerId = event.target.value;

    if (!customerId) {
      this.addOrderForm.patchValue({
        firstName: '',
        lastName: '',
        email: '',
      });
      return;
    }

    const selectedCustomer = this.customerOptions.find((customer) => customer.id === customerId);

    if (selectedCustomer) {
      this.addOrderForm.patchValue({
        firstName: selectedCustomer.firstName || '',
        lastName: selectedCustomer.lastName || '',
        email: '',
      });
    }
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

  getPhoneErrorMessage(): string {
    const phoneControl = this.getFormControl('phone');

    if (phoneControl?.errors?.['required']) {
      return 'Phone number is required';
    }

    if (phoneControl?.errors?.['pattern']) {
      return 'Please enter a valid phone number (10-20 digits with optional spaces, dashes, or parentheses)';
    }

    return 'Please enter a valid phone number';
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
      this.router.navigate(['/main/orders/orders-main', this.createdOrderId]);
    } else {
      this.router.navigate(['/main/orders/orders-main']);
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
          this.createdOrderId = orderId;
          this.toastService.success('Order created successfully!');

          // Auto-redirect after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/main/orders/orders-main']);
          }, 1000);
        },
        error: (error) => {
          const errorMessage = error.message || 'Failed to create order. Please try again.';
          this.toastService.error(errorMessage);
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
  /*showImportDialog(): void {
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
  }*/
}
