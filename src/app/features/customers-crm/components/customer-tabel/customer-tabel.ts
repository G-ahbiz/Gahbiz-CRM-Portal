import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, DestroyRef, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CustomersFacadeService } from '../../services/customers-facade.service';
import { GetCustomersResponse } from '../../interfaces/get-customers-response';
import { Subscription } from 'rxjs';
import { ROUTES } from '@shared/config/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

type CustomerViewModel = GetCustomersResponse & { selected: boolean };

@Component({
  selector: 'app-customer-tabel',
  imports: [CommonModule, TranslateModule, RouterLink, PaginatorModule],
  templateUrl: './customer-tabel.html',
  styleUrl: './customer-tabel.css',
})
export class CustomerTabel implements OnInit, OnDestroy {
  // Pagination state
  first: number = 0;
  rows: number = 4;

  private readonly destroyRef = inject(DestroyRef);
  /**
   * Get customers for current view (already paginated from API)
   */
  get paginatedCustomers(): CustomerViewModel[] {
    return this.customersTabelData();
  }

  /**
   * Handle page change events from PrimeNG paginator
   */
  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.loadCustomersData();
  }

  // Table configuration
  readonly customersTabelHeader: readonly string[] = [
    'Customer ID',
    'Phone Number',
    'Customer Name',
    'No of Orders',
    'Status',
    'Assigned To',
    'Actions',
  ];

  // Data properties
  customersTabelData = signal<CustomerViewModel[]>([]);
  totalCustomersTabelData: number = 0;
  loading = signal<boolean>(false);

  // Selection state
  isAllSelected: boolean = false;

  // Filter state
  search: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly customersFacade: CustomersFacadeService
  ) {}

  ngOnInit(): void {
    this.loadCustomersData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load customers data from API
   */
  private loadCustomersData(): void {
    const pageNumber = this.first / this.rows + 1;
    const pageSize = this.rows;

    this.loading.set(true);
    this.customersFacade
      .getAllCustomers({
        pageNumber,
        pageSize,
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
          this.totalCustomersTabelData = response.totalCount;
          this.updateSelectAllState();
        },
        error: (err) => {
          console.error('Error loading customers', err);
        },
        complete: () => {
          console.log('complete');
        },
      });
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
   * Only checks invoices on the current page
   */
  private updateSelectAllState(): void {
    const currentPageCustomers = this.customersTabelData();
    if (currentPageCustomers.length === 0) {
      this.isAllSelected = false;
      return;
    }

    const allSelected = currentPageCustomers.every((customer) => customer.selected);
    const noneSelected = currentPageCustomers.every((customer) => !customer.selected);

    this.isAllSelected = allSelected && !noneSelected;
  }

  /**
   * Navigate to customer details page
   */
  viewCustomer(id: string): void {
    this.router.navigate([ROUTES.customerDetails, id]);
  }

  onDeleteCustomer(id: string): void {
    console.log('onDeleteCustomer', id);
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
