import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { environment } from '@env/environment';
import { GetPaymentsReportResponse } from '@features/reports-crm/interfaces/get=payments-report-response';
import { PaymentReportFilters } from '@features/reports-crm/interfaces/payment-report-filters';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesReportsApiService {
  private readonly http = inject(HttpClient);

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
  }
}
