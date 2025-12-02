import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment';
import { GetAllInvoicesResponse } from '../interfaces/get-all-invoices-response';
import { Observable } from 'rxjs';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetInvoicesFilters } from '../interfaces/get-invoices-filters';

@Injectable({
  providedIn: 'root',
})
export class InvoiceApiService {
  baseUrl = `${environment.baseApi}`;

  private readonly http = inject(HttpClient);

  getAllInvoices(
    filters: GetInvoicesFilters
  ): Observable<ApiResponse<PagenatedResponse<GetAllInvoicesResponse>>> {
    const url = `${this.baseUrl}${environment.invoices.getAllInvoices}`;

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
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.lastDays) {
      params = params.set('lastDays', filters.lastDays.toString());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<ApiResponse<PagenatedResponse<GetAllInvoicesResponse>>>(url, { params });
  }
}
