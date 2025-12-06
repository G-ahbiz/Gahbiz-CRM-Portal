import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
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

@Component({
  selector: 'app-add-customers',
  imports: [TranslateModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-customers.html',
  styleUrl: './add-customers.css',
})
export class AddCustomers implements OnInit {
  addCustomerForm: FormGroup;
  salesAgents = signal<GetSalesAgentsResponse[]>([]);
  languages = Object.values(LANGUAGES);
  genders = Object.values(GENDERS);
  loading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  customerId = signal<string | null>(null);
  USER_TYPES = USER_TYPES;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private customersFacadeService = inject(CustomersFacadeService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private errorFacadeService = inject(ErrorFacadeService);
  currentUser$ = this.authService.currentUser$;

  constructor() {
    this.addCustomerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
      ssn: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(14)]],
      gender: ['', [Validators.required]],
      country: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      postalCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      defaultLanguage: ['', [Validators.required]],
      assignedAgentId: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    // Check if we're in edit mode (has ID in route)
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.customerId.set(params['id']);
        this.loadCustomerDetails(params['id']);
        // Disable fields that shouldn't be edited in update mode
        this.addCustomerForm.get('defaultLanguage')?.disable();
        this.addCustomerForm.get('assignedAgentId')?.disable();
      }
    });

    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((currentUser) => {
      if (currentUser?.type === USER_TYPES.MANAGER || currentUser?.type === USER_TYPES.ADMIN) {
        this.getSalesAgents();
      } else {
        this.addCustomerForm.get('assignedAgentId')?.setValue(currentUser?.id);
      }
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
            this.toast.error(errorMsg);
          }
          this.loading.set(false);
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(errorMsg);
          this.loading.set(false);
        },
      });
  }

  populateForm(customer: CustomerDetailsResponse) {
    // Combine first name and last name for fullName
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();

    this.addCustomerForm.patchValue({
      fullName: fullName,
      email: customer.eMail,
      phone: customer.phone,
      ssn: customer.ssn,
      gender: customer.gender,
      country: customer.country,
      state: customer.state,
      postalCode: customer.postalCode,
      address: customer.address,
      // Note: defaultLanguage and assignedAgentId will be populated by other methods
      // or will remain as they are (from user context)
    });
  }

  goBack() {
    window.history.back();
  }

  checkValidity(control: string) {
    return this.addCustomerForm.get(control)?.valid &&
      !this.addCustomerForm.get(control)?.errors?.['required']
      ? 'text-success'
      : 'text-danger';
  }

  save() {
    this.loading.set(true);
    if (this.addCustomerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.addCustomerForm.controls).forEach((key) => {
        const control = this.addCustomerForm.get(key);
        if (control?.enabled) {
          // Only mark enabled controls
          control.markAsTouched();
        }
      });
      this.loading.set(false);
      this.toast.error('Please fill all required fields correctly');
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
            this.toast.success('Customer added successfully');
            this.router.navigate([ROUTES.customersTable]);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(errorMsg);
          }
          this.loading.set(false);
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(errorMsg);
          this.loading.set(false);
        },
      });
  }

  updateCustomer() {
    // Get only the fields that are allowed in update
    const updateData: UpdateCustomerRequest = {
      fullName: this.addCustomerForm.get('fullName')?.value,
      email: this.addCustomerForm.get('email')?.value,
      phone: this.addCustomerForm.get('phone')?.value,
      gender: this.addCustomerForm.get('gender')?.value,
      country: this.addCustomerForm.get('country')?.value,
      state: this.addCustomerForm.get('state')?.value,
      postalCode: this.addCustomerForm.get('postalCode')?.value,
      address: this.addCustomerForm.get('address')?.value,
      ssn: this.addCustomerForm.get('ssn')?.value,
    };

    this.customersFacadeService
      .updateCustomer(this.customerId()!, updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toast.success('Customer updated successfully');
            this.router.navigate([ROUTES.customersTable]);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(errorMsg);
          }
          this.loading.set(false);
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(errorMsg);
          this.loading.set(false);
        },
      });
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
            this.salesAgents.set(response.data);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(errorMsg);
          }
        },
        error: (error) => {
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(errorMsg);
        },
      });
  }

  // Helper method to get validation error messages
  getErrorMessage(fieldName: string): string {
    const control = this.addCustomerForm.get(fieldName);
    if (!control || !control.errors || !control.enabled) return '';

    const errors = control.errors;

    // Map field names to user-friendly display names
    const fieldDisplayNames: { [key: string]: string } = {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      ssn: 'SSN',
      gender: 'Gender',
      country: 'Country',
      state: 'City/State',
      postalCode: 'Postal Code',
      address: 'Address',
      defaultLanguage: 'Default Language',
      assignedAgentId: 'Assigned Agent',
    };

    const displayName = fieldDisplayNames[fieldName] || fieldName;

    if (errors['required']) {
      return `${displayName} is required`;
    }

    if (errors['email']) {
      return 'Please enter a valid email address';
    }

    if (errors['minlength']) {
      return `${displayName} must be at least ${errors['minlength'].requiredLength} characters`;
    }

    if (errors['maxlength']) {
      return `${displayName} must not exceed ${errors['maxlength'].requiredLength} characters`;
    }

    return `${displayName} is invalid`;
  }
}
