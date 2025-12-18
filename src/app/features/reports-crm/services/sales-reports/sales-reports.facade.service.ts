import { Injectable } from '@angular/core';
import { SalesReportsApiService } from './sales-reports.api.service';
import { CustomerReportParams } from '@features/reports-crm/interfaces/customer-report-params';
import { Observable, of, tap, catchError, finalize, BehaviorSubject, throwError } from 'rxjs';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { CustomerReportItem } from '@features/reports-crm/interfaces/customer-report-item';
import { ErrorFacadeService } from '@core/services/error.facade.service';

export type CustomerReportResponse = ApiResponse<PagenatedResponse<CustomerReportItem>>;

@Injectable({
  providedIn: 'root',
})
export class SalesReportsFacadeService {
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private reportCacheSubject = new BehaviorSubject<CustomerReportResponse | null>(null);
  private lastFetchTime: number = 0;
  private currentParams?: CustomerReportParams;

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  reportCache$ = this.reportCacheSubject.asObservable();

  constructor(
    private salesReportsApiService: SalesReportsApiService,
    private errorFacade: ErrorFacadeService
  ) {}

  getCustomerReport(
    params?: CustomerReportParams,
    forceRefresh: boolean = false
  ): Observable<CustomerReportResponse> {
    const canUseCache = !forceRefresh && this.isCacheValid() && this.areParamsSame(params);

    if (canUseCache && this.reportCacheSubject.value) {
      return of(this.reportCacheSubject.value);
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.currentParams = params;

    return this.salesReportsApiService.getCustomerReport(params).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.reportCacheSubject.next(response);
          this.lastFetchTime = Date.now();
        } else {
          const msg = response.message ?? 'Failed to load report';
          this.errorSubject.next(msg);
          this.errorFacade.showError(response);
        }
      }),
      catchError((error) => {
        if (this.reportCacheSubject.value) {
          return of(this.reportCacheSubject.value);
        }
        const errMsg = this.errorFacade.getErrorMessage(error);
        this.errorSubject.next(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  exportCustomerReport(
    params?: CustomerReportParams
  ): Observable<Blob> {
    return this.salesReportsApiService.exportCustomerReport(params);
  }

  clearCache(): void {
    this.reportCacheSubject.next(null);
    this.lastFetchTime = 0;
    this.currentParams = undefined;
  }

  getCachedReport(): CustomerReportResponse | null {
    return this.reportCacheSubject.value;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastFetchTime < this.CACHE_DURATION;
  }

  private areParamsSame(newParams?: CustomerReportParams): boolean {
    if (!this.currentParams && !newParams) return true;
    if (!this.currentParams || !newParams) return false;

    return (
      (this.currentParams.pageNumber ?? 1) === (newParams.pageNumber ?? 1) &&
      (this.currentParams.pageSize ?? 10) === (newParams.pageSize ?? 10) &&
      (this.currentParams.search ?? '').trim() === (newParams.search ?? '').trim()
    );
  }

  refreshCurrentReport(): Observable<CustomerReportResponse> {
    return this.getCustomerReport(this.currentParams, true);
  }
}
