
import { inject, Injectable } from '@angular/core';
import { SalesReportsApiService } from './sales-reports.api.service';
import { PaymentReportFilters } from '@features/reports-crm/interfaces/payment-report-filters';
import { ApiResponse } from '@core/interfaces/api-response';
import { GetPaymentsReportResponse } from '@features/reports-crm/interfaces/get=payments-report-response';
import { SalesReportsApiService } from './sales-reports.api.service';
import { CustomerReportParams } from '@features/reports-crm/interfaces/sales-report/customer-report-params';
import { InvoiceReportParams } from '@features/reports-crm/interfaces/sales-report/invoice-report-params';
import { Observable, of, tap, catchError, finalize, BehaviorSubject, throwError } from 'rxjs';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { CustomerReportItem } from '@features/reports-crm/interfaces/sales-report/customer-report-item';
import { InvoiceReportItem } from '@features/reports-crm/interfaces/sales-report/invoice-report-item';
import { ErrorFacadeService } from '@core/services/error.facade.service';

export type CustomerReportResponse = ApiResponse<PagenatedResponse<CustomerReportItem>>;
export type InvoiceReportResponse = ApiResponse<PagenatedResponse<InvoiceReportItem>>;


@Injectable({
  providedIn: 'root',
})
export class SalesReportsFacadeService {
  private readonly salesReportsApiService = inject(SalesReportsApiService);


  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Customer report state
  private customerLoadingSubject = new BehaviorSubject<boolean>(false);
  private customerErrorSubject = new BehaviorSubject<string | null>(null);
  private customerReportCacheSubject = new BehaviorSubject<CustomerReportResponse | null>(null);
  private customerLastFetchTime: number = 0;
  private customerCurrentParams?: CustomerReportParams;

  // Invoice report state
  private invoiceLoadingSubject = new BehaviorSubject<boolean>(false);
  private invoiceErrorSubject = new BehaviorSubject<string | null>(null);
  private invoiceReportCacheSubject = new BehaviorSubject<InvoiceReportResponse | null>(null);
  private invoiceLastFetchTime: number = 0;
  private invoiceCurrentParams?: InvoiceReportParams;

  // Customer observables
  customerLoading$ = this.customerLoadingSubject.asObservable();
  customerError$ = this.customerErrorSubject.asObservable();
  customerReportCache$ = this.customerReportCacheSubject.asObservable();

  // Invoice observables
  invoiceLoading$ = this.invoiceLoadingSubject.asObservable();
  invoiceError$ = this.invoiceErrorSubject.asObservable();
  invoiceReportCache$ = this.invoiceReportCacheSubject.asObservable();

  constructor(
    private errorFacade: ErrorFacadeService
  ) {}

  // Customer Report Methods
  getCustomerReport(
    params?: CustomerReportParams,
    forceRefresh: boolean = false
  ): Observable<CustomerReportResponse> {
    const canUseCache =
      !forceRefresh && this.isCustomerCacheValid() && this.areCustomerParamsSame(params);

    if (canUseCache && this.customerReportCacheSubject.value) {
      return of(this.customerReportCacheSubject.value);
    }

    this.customerLoadingSubject.next(true);
    this.customerErrorSubject.next(null);
    this.customerCurrentParams = params;

    return this.salesReportsApiService.getCustomerReport(params).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.customerReportCacheSubject.next(response);
          this.customerLastFetchTime = Date.now();
        } else {
          const msg = response.message ?? 'Failed to load customer report';
          this.customerErrorSubject.next(msg);
          this.errorFacade.showError(response);
        }
      }),
      catchError((error) => {
        if (this.customerReportCacheSubject.value) {
          return of(this.customerReportCacheSubject.value);
        }
        const errMsg = this.errorFacade.getErrorMessage(error);
        this.customerErrorSubject.next(
          typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)
        );
        return throwError(() => error);
      }),
      finalize(() => this.customerLoadingSubject.next(false))
    );
  }

  exportCustomerReport(params?: CustomerReportParams): Observable<Blob> {
    return this.salesReportsApiService.exportCustomerReport(params);
  }

  // Invoice Report Methods
  getInvoicesReport(
    params?: InvoiceReportParams,
    forceRefresh: boolean = false
  ): Observable<InvoiceReportResponse> {
    const canUseCache =
      !forceRefresh && this.isInvoiceCacheValid() && this.areInvoiceParamsSame(params);

    if (canUseCache && this.invoiceReportCacheSubject.value) {
      return of(this.invoiceReportCacheSubject.value);
    }

    this.invoiceLoadingSubject.next(true);
    this.invoiceErrorSubject.next(null);
    this.invoiceCurrentParams = params;

    return this.salesReportsApiService.getInvoicesReport(params).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.invoiceReportCacheSubject.next(response);
          this.invoiceLastFetchTime = Date.now();
        } else {
          const msg = response.message ?? 'Failed to load invoices report';
          this.invoiceErrorSubject.next(msg);
          this.errorFacade.showError(response);
        }
      }),
      catchError((error) => {
        if (this.invoiceReportCacheSubject.value) {
          return of(this.invoiceReportCacheSubject.value);
        }
        const errMsg = this.errorFacade.getErrorMessage(error);
        this.invoiceErrorSubject.next(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        return throwError(() => error);
      }),
      finalize(() => this.invoiceLoadingSubject.next(false))
    );
  }

  exportInvoicesReport(params?: InvoiceReportParams): Observable<Blob> {
    return this.salesReportsApiService.exportInvoicesReport(params);
  }

  // Customer cache management
  clearCustomerCache(): void {
    this.customerReportCacheSubject.next(null);
    this.customerLastFetchTime = 0;
    this.customerCurrentParams = undefined;
  }

  refreshCurrentCustomerReport(): Observable<CustomerReportResponse> {
    return this.getCustomerReport(this.customerCurrentParams, true);
  }

  private isCustomerCacheValid(): boolean {
    return Date.now() - this.customerLastFetchTime < this.CACHE_DURATION;
  }

  private areCustomerParamsSame(newParams?: CustomerReportParams): boolean {
    if (!this.customerCurrentParams && !newParams) return true;
    if (!this.customerCurrentParams || !newParams) return false;

    return (
      (this.customerCurrentParams.pageNumber ?? 1) === (newParams.pageNumber ?? 1) &&
      (this.customerCurrentParams.pageSize ?? 10) === (newParams.pageSize ?? 10) &&
      (this.customerCurrentParams.search ?? '').trim() === (newParams.search ?? '').trim()
    );
  }

  // Invoice cache management
  clearInvoiceCache(): void {
    this.invoiceReportCacheSubject.next(null);
    this.invoiceLastFetchTime = 0;
    this.invoiceCurrentParams = undefined;
  }

  refreshCurrentInvoiceReport(): Observable<InvoiceReportResponse> {
    return this.getInvoicesReport(this.invoiceCurrentParams, true);
  }

  private isInvoiceCacheValid(): boolean {
    return Date.now() - this.invoiceLastFetchTime < this.CACHE_DURATION;
  }

  private areInvoiceParamsSame(newParams?: InvoiceReportParams): boolean {
    if (!this.invoiceCurrentParams && !newParams) return true;
    if (!this.invoiceCurrentParams || !newParams) return false;

    return (
      (this.invoiceCurrentParams.pageNumber ?? 1) === (newParams.pageNumber ?? 1) &&
      (this.invoiceCurrentParams.pageSize ?? 10) === (newParams.pageSize ?? 10) &&
      (this.invoiceCurrentParams.search ?? '').trim() === (newParams.search ?? '').trim() &&
      (this.invoiceCurrentParams.status ?? '') === (newParams.status ?? '') &&
      (this.invoiceCurrentParams.period ?? '') === (newParams.period ?? '') &&
      (this.invoiceCurrentParams.salesAgentId ?? '') === (newParams.salesAgentId ?? '')
    );
  }

  // Combined cache clear
  clearAllCache(): void {
    this.clearCustomerCache();
    this.clearInvoiceCache();
  }

  // Getters for current state
  getCurrentCustomerReport(): CustomerReportResponse | null {
    return this.customerReportCacheSubject.value;
  }

  getCurrentInvoiceReport(): InvoiceReportResponse | null {
    return this.invoiceReportCacheSubject.value;
  }
   getPaymentsReport(
    filters: PaymentReportFilters
  ): Observable<ApiResponse<PagenatedResponse<GetPaymentsReportResponse>>> {
    return this.salesReportsApiService.getPaymentsReport(filters);
  }

  exportPaymentsReport(filters: PaymentReportFilters): Observable<Blob> {
    return this.salesReportsApiService.exportPaymentsReport(filters);
  }
}
