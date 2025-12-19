import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { SalesReportsFacadeService } from '@features/reports-crm/services/sales-reports/sales-reports.facade.service';
import { GetPaymentsReportResponse } from '@features/reports-crm/interfaces/get=payments-report-response';
import { PaymentReportFilters } from '@features/reports-crm/interfaces/payment-report-filters';

type PeriodType = PaymentReportFilters['period'];
type PaymentMethodType = PaymentReportFilters['paymentMethod'];

@Component({
  selector: 'app-payment-table',
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DatePickerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './payment-table.html',
  styleUrl: './payment-table.css',
})
export class PaymentTable implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly salesReportsFacade = inject(SalesReportsFacadeService);

  private searchSubject = new Subject<string>();

  // Pagination state
  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  // Sorting state
  sortColumn = signal<string>('');
  sortDirection = signal<'ASC' | 'DESC'>('ASC');

  // Data properties
  paymentsData = signal<GetPaymentsReportResponse[]>([]);
  loading = signal<boolean>(false);
  exportLoading = signal<boolean>(false);

  // Computed total amount
  totalAmount = computed(() =>
    this.paymentsData().reduce((sum, payment) => sum + (payment.amount || 0), 0)
  );

  // Filter state
  searchValue = signal<string>('');
  periodValue = signal<PeriodType>('AllTime');
  paymentMethodValue = signal<PaymentMethodType | undefined>(undefined);

  // Custom date range
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(new Date());
  maxDate = signal<Date>(new Date());

  // Period options for dropdown
  periodOptions: { value: PeriodType; labelKey: string }[] = [
    { value: 'AllTime', labelKey: 'PAYMENT_REPORTS.periods.all-time' },
    { value: 'ThisMonth', labelKey: 'PAYMENT_REPORTS.periods.this-month' },
    { value: 'LastMonth', labelKey: 'PAYMENT_REPORTS.periods.last-month' },
    { value: 'ThisYear', labelKey: 'PAYMENT_REPORTS.periods.this-year' },
    { value: 'LastYear', labelKey: 'PAYMENT_REPORTS.periods.last-year' },
    { value: 'Last3Months', labelKey: 'PAYMENT_REPORTS.periods.last-3-months' },
    { value: 'Last6Months', labelKey: 'PAYMENT_REPORTS.periods.last-6-months' },
    { value: 'Last12Months', labelKey: 'PAYMENT_REPORTS.periods.last-12-months' },
    { value: 'Period', labelKey: 'PAYMENT_REPORTS.periods.custom' },
  ];

  // Payment method options for dropdown
  paymentMethodOptions: { value: PaymentMethodType | ''; labelKey: string }[] = [
    { value: '', labelKey: 'PAYMENT_REPORTS.payment-methods.all' },
    { value: 'CashOnDelivery', labelKey: 'PAYMENT_REPORTS.payment-methods.cash-on-delivery' },
    { value: 'BankTransfer', labelKey: 'PAYMENT_REPORTS.payment-methods.bank-transfer' },
    { value: 'CreditCard', labelKey: 'PAYMENT_REPORTS.payment-methods.credit-card' },
    { value: 'Paypal', labelKey: 'PAYMENT_REPORTS.payment-methods.paypal' },
  ];

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadPaymentsData();
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
        this.loadPaymentsData();
      });
  }

  /**
   * Load payments data from API
   */
  private loadPaymentsData(): void {
    this.loading.set(true);

    const filters: PaymentReportFilters = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchValue() || undefined,
      period: this.periodValue(),
      paymentMethod: this.paymentMethodValue() || undefined,
    };

    // Add custom date range if period is 'Period'
    if (this.periodValue() === 'Period') {
      if (this.fromDate()) {
        filters.fromDate = this.formatDate(this.fromDate()!);
      }
      if (this.toDate()) {
        filters.toDate = this.formatDate(this.toDate()!);
      }
    }

    this.salesReportsFacade
      .getPaymentsReport(filters)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          const data = response.data?.items || [];
          this.paymentsData.set(data);
          this.totalRecords = response.data?.totalCount || 0;
        },
        error: (err) => {
          console.error('Error loading payments report', err);
        },
      });
  }

  /**
   * Format date to ISO string (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Handle page change events from PrimeNG table
   */
  onPageChange(event: any): void {
    this.pageNumber =
      event.page !== undefined ? event.page + 1 : Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadPaymentsData();
  }

  /**
   * Handle sort events from PrimeNG table
   */
  onSortColumn(event: any): void {
    this.sortColumn.set(event.field);
    this.sortDirection.set(event.order === 1 ? 'ASC' : 'DESC');
    this.loadPaymentsData();
  }

  /**
   * Handle search input changes
   */
  onSearchChange(value: string): void {
    this.searchSubject.next(value.trim());
  }

  /**
   * Handle period filter changes
   */
  onPeriodChange(value: string): void {
    this.periodValue.set(value as PeriodType);
    this.pageNumber = 1;
    // Only reload if not custom period or if custom period has dates
    if (value !== 'Period') {
      this.fromDate.set(null);
      this.toDate.set(null);
      this.loadPaymentsData();
    }
  }

  /**
   * Handle payment method filter changes
   */
  onPaymentMethodChange(value: string): void {
    this.paymentMethodValue.set((value as PaymentMethodType) || undefined);
    this.pageNumber = 1;
    this.loadPaymentsData();
  }

  /**
   * Handle custom date range changes
   */
  onDateRangeChange(): void {
    if (this.periodValue() === 'Period' && this.fromDate() && this.toDate()) {
      this.pageNumber = 1;
      this.loadPaymentsData();
    }
  }

  /**
   * Refresh payments data
   */
  refreshPayments(): void {
    this.loadPaymentsData();
  }

  /**
   * Export payments report
   */
  exportPayments(): void {
    this.exportLoading.set(true);
    const filters: PaymentReportFilters = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchValue() || undefined,
      period: this.periodValue(),
      paymentMethod: this.paymentMethodValue() || undefined,
    };

    if (this.periodValue() === 'Period') {
      if (this.fromDate()) {
        filters.fromDate = this.formatDate(this.fromDate()!);
      }
      if (this.toDate()) {
        filters.toDate = this.formatDate(this.toDate()!);
      }
    }

    this.salesReportsFacade.exportPaymentsReport(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payments_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportLoading.set(false);
      },
      error: (err) => {
        console.error('Error exporting payments report', err);
        this.exportLoading.set(false);
      },
    });
  }
}
