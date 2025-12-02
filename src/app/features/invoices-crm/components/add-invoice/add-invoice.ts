import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ErrorFacadeService } from '@core/services/error.facade.service';
import { ToastService } from '@core/services/toast.service';
import { GetCustomersResponse } from '@features/customers-crm/interfaces/get-customers-response';
import { CustomersFacadeService } from '@features/customers-crm/services/customers-facade.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { ServiceDetails } from '@features/sales-crm/interfaces/service-details';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, of, Subject } from 'rxjs';
import { GetSalesAgentsResponse } from '@features/customers-crm/interfaces/get-sales-agents-response';
import { AuthService } from '@core/services/auth.service';
import { ROUTES, USER_TYPES } from '@shared/config/constants';
import { InvoiceFacadeService } from '@features/invoices-crm/services/invoice.facade.service';
import { AddInvoiceRequest } from '@features/invoices-crm/interfaces/add-invoice-request';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-invoice',
  imports: [TranslateModule, ReactiveFormsModule, CommonModule, MultiSelectModule, DatePicker],
  templateUrl: './add-invoice.html',
  styleUrl: './add-invoice.css',
})
export class AddInvoice implements OnInit {
  addInvoiceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addInvoiceForm = this.fb.group({
      customerId: ['', Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      dueDate: ['', Validators.required, this.dateValidator],
      notes: ['', Validators.maxLength(1000)],
      assignedSalesAgentId: ['', Validators.required],
      invoiceNumber: ['', Validators.minLength(1)],
      items: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return { invalidDateFormat: 'Invalid date format. Use DD-MM-YYYY.' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return { pastDate: 'Date must be in the future.' };
    }
    return null;
  }

  private serviceFilterSubject = new Subject<string>();
  // services
  private customerService = inject(CustomersFacadeService);
  private destroyRef = inject(DestroyRef);
  private errorFacadeService = inject(ErrorFacadeService);
  private toast = inject(ToastService);
  private leadsFacadeService = inject(LeadsFacadeService);
  private customersFacadeService = inject(CustomersFacadeService);
  private authService = inject(AuthService);
  private invoicesFacadeService = inject(InvoiceFacadeService);
  private router = inject(Router);

  //signals
  loading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  currentUser$ = this.authService.currentUser$;

  customers = signal<GetCustomersResponse[] | undefined>(undefined);
  services = signal<ServiceDetails[]>([]);
  salesAgents = signal<GetSalesAgentsResponse[]>([]);

  USER_TYPES = USER_TYPES;

  ngOnInit() {
    // Load all initial data using forkJoin - loading will be false only when all complete
    // Each observable has its own catchError so individual failures don't break the entire operation
    forkJoin({
      customers: this.customerService.getAllCustomers({ pageNumber: 1, pageSize: 30 }).pipe(
        catchError(() => {
          this.toast.error('Failed to get customers');
          return of(null);
        })
      ),
      services: this.leadsFacadeService.getAllServices().pipe(
        catchError(() => {
          this.toast.error('Failed to get services');
          return of(null);
        })
      ),
      salesAgents: this.customersFacadeService.getSalesAgents().pipe(
        catchError(() => {
          this.toast.error('Failed to get sales agents');
          return of(null);
        })
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ customers, services, salesAgents }) => {
          if (customers) {
            this.customers.set(customers.items);
          }

          if (services) {
            if (services.succeeded) {
              this.services.set(services.data.items);
            } else {
              const errorMsg = this.errorFacadeService.handleApiResponse(services);
              this.toast.error(errorMsg);
            }
          }

          if (salesAgents) {
            if (salesAgents.succeeded && salesAgents.data) {
              this.salesAgents.set(salesAgents.data);
            } else {
              const errorMsg = this.errorFacadeService.handleApiResponse(salesAgents);
              this.toast.error(errorMsg);
            }
          }

          this.loading.set(false);
        },
      });

    // If the current user is not MANAGER/ADMIN, set the assignedSalesAgentId to current user
    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((currentUser) => {
      if (currentUser?.type !== USER_TYPES.MANAGER && currentUser?.type !== USER_TYPES.ADMIN) {
        this.addInvoiceForm.get('assignedSalesAgentId')?.setValue(currentUser?.id);
      }
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

  getAllServices() {
    this.leadsFacadeService
      .getAllServices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.services.set(response.data.items);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(errorMsg);
          }
        },
        error: () => {
          this.toast.error('Failed to get services');
        },
      });
  }

  getAllCustomers() {
    this.customerService
      .getAllCustomers({ pageNumber: 1, pageSize: 30 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.customers.set(response.items);
        },
        error: () => {
          this.toast.error('Failed to get customers');
        },
      });
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
        error: () => {
          this.toast.error('Failed to get sales agents');
        },
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
        error: () => {
          this.toast.error('Failed to search services');
        },
      });
  }

  onFilterServices(event: { filter: string }) {
    // Emit to subject instead of calling directly - debounce will handle the delay
    this.serviceFilterSubject.next(event.filter || '');
  }

  back() {
    window.history.back();
  }

  checkValidity(control: string) {
    return this.addInvoiceForm.get(control)?.valid &&
      !this.addInvoiceForm.get(control)?.errors?.['required']
      ? 'text-success'
      : 'text-danger';
  }

  checkErrors(control: string) {
    return this.addInvoiceForm.get(control)?.errors && this.addInvoiceForm.get(control)?.touched;
  }

  addInvoice() {
    if (this.addInvoiceForm.invalid) {
      this.addInvoiceForm.markAllAsTouched();
      return;
    }

    const formValue = this.addInvoiceForm.value;

    // Map form values to AddInvoiceRequest interface
    const request: AddInvoiceRequest = {
      customerId: formValue.customerId,
      dueDate: formValue.dueDate,
      notes: formValue.notes || '',
      assignedSalesAgentId: formValue.assignedSalesAgentId,
      invoiceNumber: formValue.invoiceNumber,
      items:
        (formValue.items as string[])?.map((serviceId: string) => ({
          serviceId,
          quantity: 1,
        })) || [],
    };

    this.isSubmitting.set(true);

    this.invoicesFacadeService
      .addInvoice(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.succeeded) {
            this.toast.success('Invoice added successfully');
            this.router.navigate([ROUTES.invoiceMain]);
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toast.error(errorMsg);
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const errorMsg = this.errorFacadeService.handleHttpError(error);
          this.toast.error(errorMsg);
        },
      });
  }

  cancelInvoice() {
    window.history.back();
  }

  private readonly fieldLabels: Record<string, string> = {
    customerId: 'Customer',
    dueDate: 'Due Date',
    total: 'Total',
    notes: 'Notes',
    assignedSalesAgentId: 'Assigned Sales Agent',
    invoiceNumber: 'Invoice Number',
    items: 'Services',
  };

  getErrorMessage(fieldName: string): string {
    const control = this.addInvoiceForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    const label = this.fieldLabels[fieldName] || fieldName;

    if (errors['required']) return `${label} is required.`;
    if (errors['maxlength'])
      return `${label} must not exceed ${errors['maxlength'].requiredLength} characters.`;
    if (errors['minlength'])
      return `${label} must be at least ${errors['minlength'].requiredLength} characters.`;

    return 'Invalid value.';
  }
}
