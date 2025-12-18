import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { SalesReportsFacadeService } from '@features/reports-crm/services/sales-reports/sales-reports.facade.service';
import { ToastService } from '@core/services/toast.service';
import { InvoiceReportItem } from '@features/reports-crm/interfaces/sales-report/invoice-report-item';
import { InvoiceReportParams } from '@features/reports-crm/interfaces/sales-report/invoice-report-params';
import { SalesAgentBrief } from '@features/customers-crm/interfaces/sales-agent-brief';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { INVOICES_STATUS_OPTION, INVOICES_PERIOD_OPTION } from '@shared/config/constants';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';

@Component({
  selector: 'app-invoice-table',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule,
    TooltipModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  providers: [DatePipe],
  templateUrl: './invoice-table.html',
  styleUrl: './invoice-table.css',
})
export class InvoiceTable implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(SalesReportsFacadeService);
  private readonly salesAgentFacade = inject(SalesAgentFacadeService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly datePipe = inject(DatePipe);

  // Form
  filterForm: FormGroup;

  // Form controls for easy access
  searchControl!: FormControl;
  statusControl!: FormControl;
  periodControl!: FormControl;
  salesAgentIdControl!: FormControl;
  pageSizeControl!: FormControl;
  pageNumberControl!: FormControl;

  // Signals
  invoicesData = signal<InvoiceReportItem[]>([]);
  loading = signal<boolean>(false);
  exportLoading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  // Status options - will be translated in template
  statusOptions = INVOICES_STATUS_OPTION.map((option) => ({
    ...option,
    label: this.translate.instant(option.label),
  }));

  // Period options - will be translated in template
  periodOptions = INVOICES_PERIOD_OPTION.map((option) => ({
    ...option,
    label: this.translate.instant(option.label),
  }));

  salesAgentOptions = signal<{ label: string; value: string }[]>([
    { label: this.translate.instant('REPORTS.all-sales-agents'), value: '' },
  ]);

  // From facade
  loading$ = this.facade.invoiceLoading$;
  error$ = this.facade.invoiceError$;
  report$ = this.facade.invoiceReportCache$;

  // Responsive
  screenWidth: number = window.innerWidth;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      period: ['AllTime'], // Default to AllTime to match API enum
      salesAgentId: [''],
      pageSize: [10],
      pageNumber: [1],
    });
  }

  ngOnInit(): void {
    // Get form controls
    this.searchControl = this.filterForm.get('search') as FormControl;
    this.statusControl = this.filterForm.get('status') as FormControl;
    this.periodControl = this.filterForm.get('period') as FormControl;
    this.salesAgentIdControl = this.filterForm.get('salesAgentId') as FormControl;
    this.pageSizeControl = this.filterForm.get('pageSize') as FormControl;
    this.pageNumberControl = this.filterForm.get('pageNumber') as FormControl;

    // Load sales agents and initial invoices
    this.loadSalesAgents();
    this.loadInvoices();

    // Subscribe to report data
    this.report$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((report) => {
      if (report?.succeeded && report.data) {
        this.invoicesData.set(report.data.items || []);
        this.totalRecords.set(report.data.totalCount || 0);
      }
    });

    // Subscribe to loading state
    this.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isLoading) => {
      this.loading.set(isLoading);
    });

    // Subscribe to filter changes
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pageNumberControl.setValue(1);
        this.loadInvoices();
      });

    this.statusControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.pageNumberControl.setValue(1);
      this.loadInvoices();
    });

    this.periodControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.pageNumberControl.setValue(1);
      this.loadInvoices();
    });

    // Subscribe to sales agent filter changes
    this.salesAgentIdControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pageNumberControl.setValue(1);
        this.loadInvoices();
      });
  }

  loadInvoices(): void {
    const params: InvoiceReportParams = {
      pageNumber: this.pageNumberControl.value,
      pageSize: this.pageSizeControl.value,
      search: this.searchControl.value || '',
      status: this.statusControl.value || '',
      period: this.periodControl.value || 'AllTime', // Send empty string or AllTime
      salesAgentId: this.salesAgentIdControl.value || '',
    };

    this.facade
      .getInvoicesReport(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          this.toast.error(this.translate.instant('REPORTS.error-loading-invoices'));
        },
      });
  }

  onPageChange(event: any): void {
    const newPage =
      event.page !== undefined ? event.page + 1 : Math.floor(event.first / event.rows) + 1;
    this.pageNumberControl.setValue(newPage, { emitEvent: false });
    this.pageSizeControl.setValue(event.rows, { emitEvent: false });
    this.loadInvoices();
  }

  refreshInvoices(): void {
    this.facade
      .refreshCurrentInvoiceReport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          this.toast.error(this.translate.instant('REPORTS.error-refreshing-invoices'));
        },
      });
  }

  exportInvoices(): void {
    this.exportLoading.set(true);

    const params: InvoiceReportParams = {
      pageNumber: 1,
      pageSize: 10000,
      search: this.searchControl.value || '',
      status: this.statusControl.value || '',
      period: this.periodControl.value || 'AllTime',
      salesAgentId: this.salesAgentIdControl.value || '',
    };

    this.facade
      .exportInvoicesReport(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportLoading.set(false))
      )
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoices-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.toast.success(this.translate.instant('REPORTS.export-success'));
        },
        error: (error) => {
          console.error('Export API error:', error);
          this.toast.error(this.translate.instant('REPORTS.export-failed'));
        },
      });
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'MMM dd, yyyy') || '';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | null {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'PartiallyPaid':
        return 'warn';
      case 'Unpaid':
        return 'danger';
      default:
        return null;
    }
  }

  getStatusLabel(status: string): string {
    // Now using translation keys for status labels
    switch (status) {
      case 'Paid':
        return this.translate.instant('REPORTS.paid');
      case 'PartiallyPaid':
        return this.translate.instant('REPORTS.partially-paid');
      case 'Unpaid':
        return this.translate.instant('REPORTS.unpaid');
      default:
        return this.translate.instant('REPORTS.unknown');
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  trackByInvoiceId(index: number, invoice: InvoiceReportItem): string {
    return invoice.id;
  }

  getResponsiveRowsPerPageOptions(): number[] {
    return this.screenWidth < 768 ? [5, 10] : [5, 10, 20, 50];
  }

  loadSalesAgents(): void {
    this.salesAgentFacade.getSalesAgentsDropdown().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.salesAgentOptions.set([
            { label: this.translate.instant('REPORTS.all-sales-agents'), value: '' },
            ...response.data.map((agent) => ({
              label: agent.name,
              value: agent.id,
            })),
          ]);
        }
      },
      error: (error) => {
        console.error('Failed to load sales agents:', error);
        this.toast.error(this.translate.instant('REPORTS.error-loading-sales-agents'));
      },
    });
  }
}
