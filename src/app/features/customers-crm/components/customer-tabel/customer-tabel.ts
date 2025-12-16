import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  DestroyRef,
  inject,
  signal,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomersFacadeService } from '../../services/customers-facade.service';
import { GetCustomersResponse } from '../../interfaces/get-customers-response';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CustomerDetails } from '../customer-details/customer-details';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { LanguageService } from '@core/services/language.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    CustomerDetails,
    TooltipModule,
    SkeletonModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
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
  private readonly translate = inject(TranslateService);
  private readonly confirmationService = inject(ConfirmationService);
  languageService = inject(LanguageService);

  // Data properties
  customersTabelData = signal<CustomerViewModel[]>([]);
  totalRecords: number = 0;
  loading = signal<boolean>(false);
  exportLoading = signal<boolean>(false);
  bulkDeleteLoading = signal<boolean>(false);

  // Selection state
  isAllSelected: boolean = false;
  selectedCustomerIds = signal<Set<string>>(new Set()); // Store selected IDs in a Set

  // Filter state
  search: string = '';

  // Customer Details Dialog state
  showDetailsDialog = signal<boolean>(false);
  selectedCustomerForDialog = signal<string | null>(null); // Renamed for clarity

  @ViewChild('dt1') dt1: any;
  @ViewChild('searchInput') searchInput!: ElementRef;

  screenWidth: number = window.innerWidth;

  // Add for responsive pagination
  get responsiveRowsPerPageOptions(): number[] {
    return this.screenWidth < 768 ? [5, 10] : [5, 10, 20, 50];
  }

  // Track screen resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  private searchTimeout: any;
  onSearchChange(value: string): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search = value.toLowerCase().trim();
      this.pageNumber = 1;
      this.loadCustomersData();
    }, 300);
  }

  constructor(private readonly customersFacade: CustomersFacadeService, private router: Router) {}

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
              selected: this.selectedCustomerIds().has(customer.id),
            }))
          );
          this.totalRecords = response.totalCount;
          this.updateSelectAllState();
        },
        error: (err) => {
          console.error('Error loading customers', err);
          this.toast.error(this.translate.instant('CUSTOMERS-CRM.error-loading-customers'));
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
    return this.selectedCustomerIds().size;
  }

  /**
   * Handle select all checkbox toggle
   * Only affects customers on the current page
   */
  onSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    const currentSelectedIds = new Set(this.selectedCustomerIds());

    // Update selection state for all visible customers on current page
    this.customersTabelData().forEach((customer) => {
      customer.selected = this.isAllSelected;
      if (this.isAllSelected) {
        currentSelectedIds.add(customer.id);
      } else {
        currentSelectedIds.delete(customer.id);
      }
    });

    this.selectedCustomerIds.set(currentSelectedIds);
  }

  /**
   * Toggle individual customer selection
   */
  toggleCustomerSelection(customer: CustomerViewModel): void {
    customer.selected = !customer.selected;

    const currentSelectedIds = new Set(this.selectedCustomerIds());
    if (customer.selected) {
      currentSelectedIds.add(customer.id);
    } else {
      currentSelectedIds.delete(customer.id);
    }
    this.selectedCustomerIds.set(currentSelectedIds);

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
   * Open customer details dialog
   */
  viewCustomer(id: string): void {
    this.selectedCustomerForDialog.set(id);
    this.showDetailsDialog.set(true);
  }

  /**
   * Close customer details dialog
   */
  closeDetailsDialog(): void {
    this.showDetailsDialog.set(false);
    this.selectedCustomerForDialog.set(null);
  }

  /**
   * Delete single customer
   */
  onDeleteCustomer(id: string): void {
    this.confirmationService.confirm({
      message: this.translate.instant('CUSTOMERS-CRM.delete-customer-confirmation'),
      header: this.translate.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteCustomer(id);
      },
    });
  }

  private deleteCustomer(id: string): void {
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
            this.toast.success(
              this.translate.instant('CUSTOMERS-CRM.customer-deleted-successfully')
            );

            // Remove from selected IDs if it was selected
            const currentSelectedIds = new Set(this.selectedCustomerIds());
            currentSelectedIds.delete(id);
            this.selectedCustomerIds.set(currentSelectedIds);

            this.loadCustomersData();
          } else {
            this.toast.error(response.message);
          }
        },
        error: (err) => {
          console.error('Error deleting customer', err);
          this.toast.error(this.translate.instant('CUSTOMERS-CRM.error-deleting-customer'));
        },
      });
  }

  /**
   * Delete multiple selected customers
   */
  deleteSelectedCustomers(): void {
    const selectedIds = Array.from(this.selectedCustomerIds());

    if (selectedIds.length === 0) {
      this.toast.error(
        this.translate.instant('CUSTOMERS-CRM.select-at-least-one-customer-to-delete')
      );
      return;
    }

    this.confirmationService.confirm({
      message: this.translate.instant('CUSTOMERS-CRM.delete-multiple-customers-confirmation', {
        count: selectedIds.length,
      }),
      header: this.translate.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performBulkDelete(selectedIds);
      },
    });
  }

  /**
   * Perform bulk delete operation
   */
  private performBulkDelete(ids: string[]): void {
    this.bulkDeleteLoading.set(true);

    this.customersFacade
      .deleteMultipleCustomers(ids)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.bulkDeleteLoading.set(false))
      )
      .subscribe({
        next: (result) => {
          if (result.succeeded.length > 0) {
            // Show success message for successful deletions
            this.toast.success(
              this.translate.instant('CUSTOMERS-CRM.customers-deleted-successfully', {
                count: result.succeeded.length,
              })
            );

            // Remove successful deletions from selected IDs
            const currentSelectedIds = new Set(this.selectedCustomerIds());
            result.succeeded.forEach((id) => currentSelectedIds.delete(id));
            this.selectedCustomerIds.set(currentSelectedIds);
          }

          if (result.failed.length > 0) {
            // Show error message for failed deletions
            const errorMessage = this.translate.instant(
              'CUSTOMERS-CRM.some-customers-delete-failed',
              {
                count: result.failed.length,
              }
            );
            this.toast.error(errorMessage);

            // Log detailed errors for debugging
            console.error('Failed to delete customers:', result.failed);
          }

          // Reload the data
          this.loadCustomersData();
        },
        error: (err) => {
          console.error('Error in bulk delete operation:', err);
          this.toast.error(this.translate.instant('CUSTOMERS-CRM.error-deleting-customers'));
        },
      });
  }

  editCustomer(id: number) {
    this.router.navigate(['/main/customers/edit-customer', id]);
  }

  /**
   * Export selected customers
   */
  exportCustomers(): void {
    const selectedIds = Array.from(this.selectedCustomerIds());

    if (selectedIds.length === 0) {
      this.toast.error(
        this.translate.instant('CUSTOMERS-CRM.select-at-least-one-customer-to-export')
      );
      return;
    }

    this.exportLoading.set(true);
    this.customersFacade
      .exportCustomers(selectedIds)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportLoading.set(false))
      )
      .subscribe({
        next: (blob: Blob) => {
          // Create a download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Set filename with timestamp
          const timestamp = new Date().toISOString().slice(0, 10);
          link.download = `customers-export-${timestamp}.xlsx`;

          // Trigger download
          document.body.appendChild(link);
          link.click();

          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Show success message with count
          const successMessage = this.translate.instant('CUSTOMERS-CRM.export-success', {
            count: selectedIds.length,
          });
          this.toast.success(successMessage);
        },
        error: (error) => {
          console.error('Export error:', error);
          this.toast.error(this.translate.instant('CUSTOMERS-CRM.export-failed'));
        },
      });
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selectedCustomerIds.set(new Set());
    this.customersTabelData().forEach((customer) => {
      customer.selected = false;
    });
    this.isAllSelected = false;
    this.toast.info(this.translate.instant('CUSTOMERS-CRM.selection-cleared'));
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByCustomerId(index: number, customer: CustomerViewModel): string {
    return customer.id;
  }

  // Optimize performance for large datasets
  trackByFn(index: number, item: CustomerViewModel): string {
    return item.id;
  }
}
