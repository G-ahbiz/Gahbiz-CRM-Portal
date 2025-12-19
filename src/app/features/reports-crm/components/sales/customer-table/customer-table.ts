import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { SalesReportsFacadeService } from '@features/reports-crm/services/sales-reports/sales-reports.facade.service';
import { CustomerReportParams } from '@features/reports-crm/interfaces/sales-report/customer-report-params';
import { ToastService } from '@core/services/toast.service';
import { CustomerReportItem } from '@features/reports-crm/interfaces/sales-report/customer-report-item';
import { CustomerDetails } from '@features/customers-crm/components/customer-details/customer-details';
import { finalize } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-customer-table',
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
    CustomerDetails,
  ],
  templateUrl: './customer-table.html',
  styleUrl: './customer-table.css',
})
export class CustomerTable implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(SalesReportsFacadeService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  // Form
  searchForm: FormGroup;

  // Form controls for easy access
  searchControl!: FormControl;
  pageSizeControl!: FormControl;
  pageNumberControl!: FormControl;

  // Signals
  customersData = signal<CustomerReportItem[]>([]);
  loading = signal<boolean>(false);
  exportLoading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  showDetailsDialog = signal<boolean>(false);
  selectedCustomerForDialog = signal<string | null>(null);

  // From facade
  loading$ = this.facade.customerLoading$;
  error$ = this.facade.customerError$;
  report$ = this.facade.customerReportCache$;

  // Responsive
  screenWidth: number = window.innerWidth;

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
      pageSize: [10],
      pageNumber: [1],
    });
  }

  ngOnInit(): void {
    // Get form controls
    this.searchControl = this.searchForm.get('search') as FormControl;
    this.pageSizeControl = this.searchForm.get('pageSize') as FormControl;
    this.pageNumberControl = this.searchForm.get('pageNumber') as FormControl;

    // Initial load
    this.loadReport();

    // Subscribe to report data
    this.report$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((report) => {
      if (report?.succeeded && report.data) {
        this.customersData.set(report.data.items || []);
        this.totalRecords.set(report.data.totalCount || 0);
      }
    });

    // Subscribe to loading state
    this.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isLoading) => {
      this.loading.set(isLoading);
    });
  }

  loadReport(): void {
    const params: CustomerReportParams = {
      pageNumber: this.pageNumberControl.value,
      pageSize: this.pageSizeControl.value,
      search: this.searchControl.value || '',
    };

    this.facade
      .getCustomerReport(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          this.toast.error(this.translate.instant('REPORTS.error-loading-report'));
        },
      });
  }

  onPageChange(event: any): void {
    const newPage =
      event.page !== undefined ? event.page + 1 : Math.floor(event.first / event.rows) + 1;
    this.pageNumberControl.setValue(newPage, { emitEvent: false });
    this.pageSizeControl.setValue(event.rows, { emitEvent: false });
    this.loadReport();
  }

  refreshReport(): void {
    this.facade
      .refreshCurrentCustomerReport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          this.toast.error(this.translate.instant('REPORTS.error-refreshing-report'));
        },
      });
  }

  exportReport(): void {
    this.exportLoading.set(true);

    const params: CustomerReportParams = {
      pageNumber: 1,
      pageSize: 10000,
      search: this.searchControl.value || '',
    };

    this.facade
      .exportCustomerReport(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportLoading.set(false))
      )
      .subscribe({
        next: (blob: Blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `customer-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
          link.click();

          // Cleanup
          window.URL.revokeObjectURL(url);
          this.toast.success(this.translate.instant('REPORTS.export-success'));
        },
        error: (error) => {
          console.error('Export API error:', error);
          this.toast.error(this.translate.instant('REPORTS.export-failed'));
        },
      });
  }

  getResponsiveRowsPerPageOptions(): number[] {
    return this.screenWidth < 768 ? [5, 10] : [5, 10, 20, 50];
  }

  viewCustomer(id: string): void {
    this.selectedCustomerForDialog.set(id);
    this.showDetailsDialog.set(true);
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog.set(false);
    this.selectedCustomerForDialog.set(null);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // TrackBy for performance
  trackByCustomerId(index: number, customer: CustomerReportItem): string {
    return customer.customerId;
  }
}
