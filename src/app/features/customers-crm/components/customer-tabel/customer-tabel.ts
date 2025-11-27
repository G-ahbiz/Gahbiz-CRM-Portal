import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { CustomersFacadeService } from '../../services/customers-facade.service';
import { GetCustomersResponse } from '../../interfaces/get-customers-response';
import { ROUTES } from '@shared/config/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

type CustomerViewModel = GetCustomersResponse & { selected: boolean };

const ALLOWED_SORT_FIELDS = ['Name'] as const;

@Component({
  selector: 'app-customer-tabel',
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './customer-tabel.html',
  styleUrl: './customer-tabel.css',
})
export class CustomerTabel implements OnInit {
  // Pagination state
  pageNumber: number = 1;
  pageSize: number = 10;

  // Sorting state
  sortColumn = signal<string>('');
  sortDirection = signal<'ASC' | 'DESC'>('ASC');

  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  // Data properties
  customersTabelData = signal<CustomerViewModel[]>([]);
  totalRecords: number = 0;
  loading = signal<boolean>(false);

  // Selection state
  isAllSelected: boolean = false;

  // Filter state
  search: string = '';

  constructor(
    private readonly router: Router,
    private readonly customersFacade: CustomersFacadeService
  ) {}

  ngOnInit(): void {
    this.loadCustomersData();
  }

  /**
   * Load customers data from API
   */
  private loadCustomersData(): void {
    this.loading.set(true);
    this.customersFacade
      .getAllCustomers({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sortColumn: this.sortColumn() || undefined,
        sortDirection: this.sortColumn() ? this.sortDirection() : undefined,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          const data = response.items || [];
          this.customersTabelData.set(
            data.map((customer) => ({
              ...customer,
              selected: false,
            }))
          );
          this.totalRecords = response.totalCount;
          this.updateSelectAllState();
        },
        error: (err) => {
          console.error('Error loading customers', err);
        },
      });
  }

  /**
   * Handle page change events from PrimeNG table
   */
  onPageChange(event: any): void {
    this.pageNumber =
      event.page !== undefined ? event.page + 1 : Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadCustomersData();
  }

  /**
   * Handle sort events from PrimeNG table
   */
  onSortColumn(event: any): void {
    if (event.field === 'fullName') {
      event.field = 'Name';
    }
    if (!ALLOWED_SORT_FIELDS.includes(event.field)) {
      console.warn(`Sorting not allowed for field: ${event.field}`);
      return;
    }

    this.sortColumn.set(event.field);
    this.sortDirection.set(event.order === 1 ? 'ASC' : 'DESC');
    this.loadCustomersData();
  }

  /**
   * Get count of selected customers
   */
  get selectedCustomersCount(): number {
    return this.customersTabelData().filter((customer) => customer.selected).length;
  }

  /**
   * Handle select all checkbox toggle
   * Only affects customers on the current page
   */
  onSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    // Update selection state for all visible customers on current page
    this.customersTabelData().forEach((customer) => {
      customer.selected = this.isAllSelected;
    });
  }

  /**
   * Toggle individual customer selection
   */
  toggleCustomerSelection(customer: CustomerViewModel): void {
    customer.selected = !customer.selected;

    // Update "select all" state based on individual selections
    this.updateSelectAllState();
  }

  /**
   * Update the select all checkbox state based on individual selections
   */
  private updateSelectAllState(): void {
    const currentPageCustomers = this.customersTabelData();
    if (currentPageCustomers.length === 0) {
      this.isAllSelected = false;
      return;
    }

    this.isAllSelected = currentPageCustomers.every((customer) => customer.selected);
  }

  /**
   * Navigate to customer details page
   */
  viewCustomer(id: string): void {
    this.router.navigate([ROUTES.customerDetails, id]);
  }

  onDeleteCustomer(id: string): void {
    this.loading.set(true);
    this.customersFacade
      .deleteCustomer(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toast.success('Customer deleted successfully');
            this.loadCustomersData();
          } else {
            this.toast.error(response.message);
          }
        },
        error: (err) => {
          console.error('Error deleting customer', err);
          this.toast.error('Error deleting customer');
        },
      });
  }

  editCustomer(id: string): void {
    console.log('editCustomer', id);
  }

  /**
   * Handle search input changes
   * Note: Search is currently disabled/ignored until API support is added
   */
  onSearchChange(value: string): void {
    this.search = value.toLowerCase().trim();
    // Search not implemented yet
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByCustomerId(index: number, customer: CustomerViewModel): string {
    return customer.id;
  }
}
