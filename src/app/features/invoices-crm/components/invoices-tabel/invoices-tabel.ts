import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InvoiceFacadeService } from '../../services/invoice.facade.service';
import { GetAllInvoicesResponse } from '../../interfaces/get-all-invoices-response';
import { GetInvoicesFilters } from '../../interfaces/get-invoices-filters';
import { Subject } from 'rxjs';
import { ROUTES } from '@shared/config/constants';

// Constants
const SESSION_STORAGE_KEYS = {
  INVOICE_ID: 'invoiceId',
} as const;

const DATE_FILTER_DAYS: Record<string, number> = {
  all: 0,
  'last-7-days': 7,
  'last-30-days': 30,
  'last-60-days': 60,
  'last-90-days': 90,
  'last-180-days': 180,
  'last-365-days': 365,
} as const;

type FilterValue = keyof typeof DATE_FILTER_DAYS;
type InvoiceViewModel = GetAllInvoicesResponse & { selected: boolean };

@Component({
  selector: 'app-invoices-tabel',
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
  templateUrl: './invoices-tabel.html',
  styleUrl: './invoices-tabel.css',
})
export class InvoicesTabel implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly invoiceFacade = inject(InvoiceFacadeService);

  private searchSubject = new Subject<string>();

  // Pagination state
  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  // Sorting state
  sortColumn = signal<string>('');
  sortDirection = signal<'ASC' | 'DESC'>('ASC');

  // Data properties
  invoicesTabelData = signal<InvoiceViewModel[]>([]);
  loading = signal<boolean>(false);

  // Selection state
  isAllSelected: boolean = false;

  // Filter state
  searchValue = signal<string>('');
  filterValue: FilterValue = 'all';

  Routes = ROUTES;

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadInvoicesData();
  }

  /**
   * Setup search subject subscription with debounce
   */
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue) => {
        this.searchValue.set(searchValue);
        this.pageNumber = 1;
        this.loadInvoicesData();
      });
  }

  /**
   * Load invoices data from API
   */
  private loadInvoicesData(): void {
    this.loading.set(true);

    const filters: GetInvoicesFilters = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchValue() || undefined,
      lastDays: DATE_FILTER_DAYS[this.filterValue] || undefined,
      sortBy: this.sortColumn() || undefined,
      sortDirection: this.sortColumn() ? this.sortDirection() : undefined,
    };

    this.invoiceFacade
      .getAllInvoices(filters)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          const data = response.data?.items || [];
          this.invoicesTabelData.set(
            data.map((invoice) => ({
              ...invoice,
              selected: false,
            }))
          );
          this.totalRecords = response.data?.totalCount || 0;
          this.updateSelectAllState();
        },
        error: (err) => {
          console.error('Error loading invoices', err);
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
    this.loadInvoicesData();
  }

  /**
   * Handle sort events from PrimeNG table
   */
  onSortColumn(event: any): void {
    this.sortColumn.set(event.field);
    this.sortDirection.set(event.order === 1 ? 'ASC' : 'DESC');
    this.loadInvoicesData();
  }

  /**
   * Get count of selected invoices
   */
  get selectedInvoicesCount(): number {
    return this.invoicesTabelData().filter((invoice) => invoice.selected).length;
  }

  /**
   * Handle select all checkbox toggle
   * Only affects invoices on the current page
   */
  onSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    // Update selection state for all visible invoices on current page
    this.invoicesTabelData().forEach((invoice) => {
      invoice.selected = this.isAllSelected;
    });
  }

  /**
   * Toggle individual invoice selection
   */
  toggleInvoiceSelection(invoice: InvoiceViewModel): void {
    invoice.selected = !invoice.selected;

    // Update "select all" state based on individual selections
    this.updateSelectAllState();
  }

  /**
   * Update the select all checkbox state based on individual selections
   */
  private updateSelectAllState(): void {
    const currentPageInvoices = this.invoicesTabelData();
    if (currentPageInvoices.length === 0) {
      this.isAllSelected = false;
      return;
    }

    this.isAllSelected = currentPageInvoices.every((invoice) => invoice.selected);
  }

  /**
   * Navigate to invoice details page
   */
  addInvoice(): void {
    this.router.navigate([ROUTES.addInvoice]);
  }

  /**
   * Navigate to invoice details page
   */
  viewInvoice(id: number): void {
    this.router.navigate([ROUTES.getInvoiceDeatils, id]);
  }

  /**
   * Navigate to update invoice page
   */
  updateInvoice(id: string) {
    this.router.navigate([ROUTES.updateInvoice, id]);
  }
  /**
   * Handle search input changes
   */
  onSearchChange(value: string): void {
    this.searchSubject.next(value.trim());
  }

  /**
   * Handle filter dropdown changes
   */
  onFilterChange(value: string): void {
    this.filterValue = value as FilterValue;
    this.pageNumber = 1; // Reset to first page when filtering
    this.loadInvoicesData();
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByInvoiceId(index: number, invoice: InvoiceViewModel): number {
    return invoice.id;
  }
}
