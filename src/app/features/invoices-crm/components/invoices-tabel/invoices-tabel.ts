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
  computed,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { InvoiceFacadeService } from '../../services/invoice.facade.service';
import { GetAllInvoicesResponse } from '../../interfaces/get-all-invoices-response';
import { GetInvoicesFilters } from '../../interfaces/get-invoices-filters';
import { ROUTES } from '@shared/config/constants';
import { InvoicesStatistics } from '@features/invoices-crm/interfaces/statistics';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { ErrorFacadeService } from '@core/services/error.facade.service';

// Constants
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
    TooltipModule,
    SkeletonModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './invoices-tabel.html',
  styleUrl: './invoices-tabel.css',
})
export class InvoicesTabel implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly invoiceFacade = inject(InvoiceFacadeService);
  private readonly toast = inject(ToastService);
  readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);
  readonly languageService = inject(LanguageService);
  private readonly errorFacade = inject(ErrorFacadeService);

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
  exportLoading = signal<boolean>(false);

  // Selection state
  isAllSelected: boolean = false;
  selectedInvoiceIds = signal<Set<string>>(new Set());

  // Filter state
  searchValue = signal<string>('');
  filterValue: FilterValue = 'all';

  // Screen width for responsive design
  screenWidth: number = window.innerWidth;

  // Responsive rows per page - EXACTLY like customer component
  get responsiveRowsPerPageOptions(): number[] {
    return this.screenWidth < 768 ? [5, 10] : [5, 10, 20, 50];
  }

  @ViewChild('dt1') dt1: any;
  @ViewChild('searchInput') searchInput!: ElementRef;

  Routes = ROUTES;

  // Track screen resize - EXACTLY like customer component
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadInvoicesData();
  }

  /**
   * Setup search subject subscription with debounce
   */
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
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
              selected: this.selectedInvoiceIds().has(invoice.id.toString()),
            }))
          );
          this.totalRecords = response.data?.totalCount || 0;
          this.updateSelectAllState();
        },
        error: (err) => {
          console.error('Error loading invoices', err);
          this.errorFacade.showError(err);
        },
      });
  }

  /**
   * Export selected invoices
   */
  exportSelectedInvoices(): void {
    const selectedInvoiceIds = Array.from(this.selectedInvoiceIds());

    if (selectedInvoiceIds.length === 0) {
      this.toast.error(this.translate.instant('INVOICES.select-at-least-one-invoice-to-export'));
      return;
    }

    this.exportLoading.set(true);

    this.invoiceFacade
      .exportInvoice(selectedInvoiceIds)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportLoading.set(false))
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.downloadFile(response);
          this.toast.success(
            this.translate.instant('INVOICES.export-success', {
              count: selectedInvoiceIds.length,
            })
          );
        },
        error: (err) => {
          this.errorFacade.showError(err as Error);
        },
      });
  }

  /**
   * Download the file from blob response
   */
  private downloadFile(response: HttpResponse<Blob>): void {
    const blob = response.body;
    if (!blob) {
      this.toast.error('No data received');
      return;
    }

    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'invoices_export.xlsx';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].trim());
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
    return this.selectedInvoiceIds().size;
  }

  /**
   * Handle select all checkbox toggle
   */
  onSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    const currentSelectedIds = new Set(this.selectedInvoiceIds());

    this.invoicesTabelData().forEach((invoice) => {
      invoice.selected = this.isAllSelected;
      if (this.isAllSelected) {
        currentSelectedIds.add(invoice.id.toString());
      } else {
        currentSelectedIds.delete(invoice.id.toString());
      }
    });

    this.selectedInvoiceIds.set(currentSelectedIds);
  }

  /**
   * Toggle individual invoice selection
   */
  toggleInvoiceSelection(invoice: InvoiceViewModel): void {
    invoice.selected = !invoice.selected;

    const currentSelectedIds = new Set(this.selectedInvoiceIds());
    if (invoice.selected) {
      currentSelectedIds.add(invoice.id.toString());
    } else {
      currentSelectedIds.delete(invoice.id.toString());
    }
    this.selectedInvoiceIds.set(currentSelectedIds);

    this.updateSelectAllState();
  }

  /**
   * Update the select all checkbox state
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
   * Navigate to add invoice page
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
    console.log(this.searchValue());
  }

  /**
   * Handle filter dropdown changes
   */
  onFilterChange(value: string): void {
    this.filterValue = value as FilterValue;
    this.pageNumber = 1;
    this.loadInvoicesData();
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selectedInvoiceIds.set(new Set());
    this.invoicesTabelData().forEach((invoice) => {
      invoice.selected = false;
    });
    this.isAllSelected = false;
    this.toast.info(this.translate.instant('INVOICES.selection-cleared'));
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByInvoiceId(index: number, invoice: InvoiceViewModel): number {
    return invoice.id;
  }
}
