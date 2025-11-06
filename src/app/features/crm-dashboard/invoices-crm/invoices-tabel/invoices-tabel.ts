import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { AllData } from '../../../../services/all-data';
import { Invoice } from '../../../../services/interfaces/all-interfaces';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

// Constants
const SESSION_STORAGE_KEYS = {
  INVOICE_ID: 'invoiceId'
} as const;

const DATE_FILTER_DAYS: Record<string, number> = {
  'all': 0,
  'last-7-days': 7,
  'last-30-days': 30,
  'last-60-days': 60,
  'last-90-days': 90,
  'last-180-days': 180,
  'last-365-days': 365
} as const;

// // Interfaces
// export interface Invoice {
//   id: number;
//   customer: string;
//   billDate: string;
//   dueDate: string;
//   total: number;
//   paymentReceived: number;
//   due: number;
//   status: string;
//   selected?: boolean;
// }

type FilterValue = keyof typeof DATE_FILTER_DAYS;

@Component({
  selector: 'app-invoices-tabel',
  imports: [CommonModule, TranslateModule, RouterLink, PaginatorModule],
  templateUrl: './invoices-tabel.html',
  styleUrl: './invoices-tabel.css',
})
export class InvoicesTabel implements OnInit, OnDestroy {

  // Pagination state
  first: number = 0;
  rows: number = 4;

  /**
   * Get paginated data slice based on current page state
   */
  get paginatedInvoices(): Invoice[] {
    const start = this.first;
    const end = this.first + this.rows;
    return this.paginationData.slice(start, end);
  }

  /**
   * Handle page change events from PrimeNG paginator
   */
  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.updateSelectAllState();
  }

  // Table configuration
  readonly invoicesTabelHeader: readonly string[] = [
    'Invoices ID',
    'CUSTOMER',
    'Bill Date',
    'DUE DATE',
    'Total',
    'Payment Received',
    'Due',
    'Status',
    'Actions',
  ];

  // Data properties
  private allInvoicesData: Invoice[] = [];
  invoicesTabelData: Invoice[] = [];
  paginationData: Invoice[] = [];
  totalInvoicesTabelData: number = 0;

  // Selection state
  isAllSelected: boolean = false;

  // Filter state
  search: string = '';
  filterValue: FilterValue = 'all';

  constructor(
    private readonly router: Router,
    private readonly allData: AllData
  ) { }

  ngOnInit(): void {
    this.loadInvoicesData();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Load initial invoices data from service
   */
  private loadInvoicesData(): void {
    this.allInvoicesData = this.allData.getInvoicesTabelData().map((invoice: any) => ({
      ...invoice,
      selected: false
    }));
    this.invoicesTabelData = [...this.allInvoicesData];
    this.applyFilters();
  }

  /**
   * Get count of selected invoices
   */
  get selectedInvoicesCount(): number {
    return this.paginationData.filter(invoice => invoice.selected).length;
  }

  /**
   * Handle select all checkbox toggle
   * Only affects invoices on the current page
   */
  onSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    // Update selection state for all visible invoices on current page
    this.paginatedInvoices.forEach(invoice => {
      invoice.selected = this.isAllSelected;
    });
  }

  /**
   * Toggle individual invoice selection
   */
  toggleInvoiceSelection(invoice: Invoice): void {
    invoice.selected = !invoice.selected;

    // Update "select all" state based on individual selections
    this.updateSelectAllState();
  }

  /**
   * Update the select all checkbox state based on individual selections
   * Only checks invoices on the current page
   */
  private updateSelectAllState(): void {
    const currentPageInvoices = this.paginatedInvoices;
    if (currentPageInvoices.length === 0) {
      this.isAllSelected = false;
      return;
    }

    const allSelected = currentPageInvoices.every(invoice => invoice.selected);
    const noneSelected = currentPageInvoices.every(invoice => !invoice.selected);

    this.isAllSelected = allSelected && !noneSelected;
  }

  /**
   * Navigate to invoice details page
   */
  viewInvoice(id: number): void {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.INVOICE_ID, id.toString());
    this.router.navigate(['/main/invoices/invoice-details']);
  }

  /**
   * Handle search input changes and filter invoices data
   */
  onSearchChange(value: string): void {
    this.search = value.toLowerCase().trim();
    this.applyFilters();
  }

  /**
   * Handle filter dropdown changes and apply date range filtering
   */
  onFilterChange(value: string): void {
    this.filterValue = value as FilterValue;
    this.applyFilters();
  }

  /**
   * Apply both search and date filters to the invoices data
   * Searches across multiple invoice fields
   * Filters by date range based on the selected filter value
   */
  private applyFilters(): void {
    let filtered = this.applyDateFilter([...this.invoicesTabelData]);
    filtered = this.applySearchFilter(filtered);

    this.paginationData = filtered;
    this.totalInvoicesTabelData = filtered.length;

    // Reset to first page when filters change
    this.first = 0;
  }

  /**
   * Apply date range filter to invoices
   */
  private applyDateFilter(invoices: Invoice[]): Invoice[] {
    if (this.filterValue === 'all') {
      return invoices;
    }

    const days = DATE_FILTER_DAYS[this.filterValue] || 7;
    const cutoffDate = this.getDateDaysAgo(days);

    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.billDate);
      return invoiceDate >= cutoffDate;
    });
  }

  /**
   * Apply search filter to invoices
   */
  private applySearchFilter(invoices: Invoice[]): Invoice[] {
    if (!this.search) {
      return invoices;
    }

    return invoices.filter(invoice => this.matchesSearchTerm(invoice, this.search));
  }

  /**
   * Check if an invoice matches the search term
   */
  private matchesSearchTerm(invoice: Invoice, searchTerm: string): boolean {
    const searchableFields = [
      invoice.id?.toString(),
      invoice.customer,
      invoice.billDate,
      invoice.dueDate,
      invoice.total?.toString(),
      invoice.paymentReceived?.toString(),
      invoice.due?.toString(),
      invoice.status
    ];

    return searchableFields.some(field =>
      field?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get a date object for N days ago
   */
  private getDateDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByInvoiceId(index: number, invoice: Invoice): number {
    return invoice.id;
  }
}
