import { HttpClient, HttpParams } from '@angular/common/http';

import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { environment } from '@env/environment';
import { GetPaymentsReportResponse } from '@features/reports-crm/interfaces/get=payments-report-response';
import { PaymentReportFilters } from '@features/reports-crm/interfaces/payment-report-filters';
import { ErrorFacadeService } from '@core/services/error.facade.service';
import { CustomerReportItem } from '@features/reports-crm/interfaces/sales-report/customer-report-item';
import { CustomerReportParams } from '@features/reports-crm/interfaces/sales-report/customer-report-params';
import { InvoiceReportItem } from '@features/reports-crm/interfaces/sales-report/invoice-report-item';
import { InvoiceReportParams } from '@features/reports-crm/interfaces/sales-report/invoice-report-params';
import { Observable, catchError, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class SalesReportsApiService {
  private readonly http = inject(HttpClient);
  apiUrl = `${environment.baseApi}`;

  constructor(private errorFacade: ErrorFacadeService) {}
  getPaymentsReport(
    filters: PaymentReportFilters
  ): Observable<ApiResponse<PagenatedResponse<GetPaymentsReportResponse>>> {
    const url = `${environment.baseApi}${environment.reports.getPaymentsReport}`;

    let params = new HttpParams();
    if (filters.pageNumber) {
      params = params.set('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.paymentMethod) {
      params = params.set('paymentMethod', filters.paymentMethod);
    }
    if (filters.period) {
      params = params.set('period', filters.period);
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    return this.http.get<ApiResponse<PagenatedResponse<GetPaymentsReportResponse>>>(url, {
      params,
    });
  }

  exportPaymentsReport(filters: PaymentReportFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters.pageNumber) {
      params = params.set('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.paymentMethod) {
      params = params.set('paymentMethod', filters.paymentMethod);
    }
    if (filters.period) {
      params = params.set('period', filters.period);
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    const url = `${environment.baseApi}${environment.reports.exportPaymentsReport}`;
    return this.http.get<Blob>(url, { params, responseType: 'blob' as 'json' });


  getCustomerReport(
    params?: CustomerReportParams
  ): Observable<ApiResponse<PagenatedResponse<CustomerReportItem>>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber !== undefined && params.pageNumber !== null) {
        httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
      }

      if (params.pageSize !== undefined && params.pageSize !== null) {
        httpParams = httpParams.set('PageSize', params.pageSize.toString());
      }

      if (params.search?.trim()) {
        httpParams = httpParams.set('Search', params.search.trim());
      }
    }

    return this.http
      .get<ApiResponse<PagenatedResponse<CustomerReportItem>>>(
        `${this.apiUrl}${environment.reports.customerReport}`,
        { params: httpParams }
      )
      .pipe(
        catchError((error) => {
          this.errorFacade.showError(error);
          return throwError(() => error);
        })
      );
  }

  exportCustomerReport(params?: CustomerReportParams): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber !== undefined && params.pageNumber !== null) {
        httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
      }

      if (params.pageSize !== undefined && params.pageSize !== null) {
        httpParams = httpParams.set('PageSize', params.pageSize.toString());
      }

      if (params.search?.trim()) {
        httpParams = httpParams.set('Search', params.search.trim());
      }
    }

    return this.http
      .get(`${this.apiUrl}${environment.reports.customerExports}`, {
        params: httpParams,
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          this.errorFacade.showError(error);
          return throwError(() => error);
        })
      );
  }

  getInvoicesReport(
    params?: InvoiceReportParams
  ): Observable<ApiResponse<PagenatedResponse<InvoiceReportItem>>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber !== undefined && params.pageNumber !== null) {
        httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
      }

      if (params.pageSize !== undefined && params.pageSize !== null) {
        httpParams = httpParams.set('PageSize', params.pageSize.toString());
      }

      if (params.search?.trim()) {
        httpParams = httpParams.set('Search', params.search.trim());
      }

      if (params.status?.trim()) {
        httpParams = httpParams.set('Status', params.status.trim());
      }

      if (params.period?.trim()) {
        httpParams = httpParams.set('Period', params.period.trim());
      }

      if (params.salesAgentId?.trim()) {
        httpParams = httpParams.set('SalesAgentId', params.salesAgentId.trim());
      }
    }

    return this.http
      .get<ApiResponse<PagenatedResponse<InvoiceReportItem>>>(
        `${this.apiUrl}${environment.reports.invoicesReport}`,
        { params: httpParams }
      )
      .pipe(
        catchError((error) => {
          this.errorFacade.showError(error);
          return throwError(() => error);
        })
      );
  }

  exportInvoicesReport(params?: InvoiceReportParams): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber !== undefined && params.pageNumber !== null) {
        httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
      }

      if (params.pageSize !== undefined && params.pageSize !== null) {
        httpParams = httpParams.set('PageSize', params.pageSize.toString());
      }

      if (params.search?.trim()) {
        httpParams = httpParams.set('Search', params.search.trim());
      }

      if (params.status?.trim()) {
        httpParams = httpParams.set('Status', params.status.trim());
      }

      if (params.period?.trim()) {
        httpParams = httpParams.set('Period', params.period.trim());
      }

      if (params.salesAgentId?.trim()) {
        httpParams = httpParams.set('SalesAgentId', params.salesAgentId.trim());
      }
    }

    return this.http
      .get(`${this.apiUrl}${environment.reports.invoicesExports}`, {
        params: httpParams,
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          this.errorFacade.showError(error);
          return throwError(() => error);
        })
      );
  }
}
