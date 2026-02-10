import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/interfaces/api-response';
import { Observable } from 'rxjs';
import { SalesAgentBrief } from '../interfaces/sales-agent-brief';
import { GetCustomersResponse } from '../interfaces/get-customers-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetCustomersFilters } from '../interfaces/get-customers-filters';
import { CustomerDetailsResponse } from '../interfaces/customer-details-response';
import { UpdateCustomerRequest } from '../interfaces/update-customer-request';
import { CustomersStatistics } from '../interfaces/customers-statistics';

@Injectable({
  providedIn: 'root',
})
export class CustomersApiService {
  readonly baseUrl = environment.baseApi;
  private http = inject(HttpClient);

  addCustomer(customer: FormData): Observable<ApiResponse<string>> {
    const url = `${this.baseUrl}${environment.customers.addCustomer}`;
    return this.http.post<ApiResponse<string>>(url, customer);
  }

  getAllCustomers(
    filters: GetCustomersFilters,
  ): Observable<PagenatedResponse<GetCustomersResponse>> {
    const url = `${this.baseUrl}${environment.customers.getAllCustomers}`;
    let params = new HttpParams();
    if (filters.pageNumber) {
      params = params.set('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }
    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }
    if (filters.days) {
      params = params.set('days', filters.days.toString());
    }
    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }
    return this.http.get<PagenatedResponse<GetCustomersResponse>>(url, { params });
  }

  getCustomerDetails(
    id?: string,
    customerName?: string,
  ): Observable<ApiResponse<CustomerDetailsResponse>> {
    const url = `${this.baseUrl}${environment.customers.getCustomer}`;
    return this.http.get<ApiResponse<CustomerDetailsResponse>>(url, {
      params: {
        id: id ?? '',
        customerName: customerName ?? '',
      },
    });
  }

  getCustomer(
    id?: string,
    customerName?: string,
  ): Observable<ApiResponse<CustomerDetailsResponse>> {
    const url = `${this.baseUrl}${environment.customers.getCustomer}`;
    let params = new HttpParams();
    if (id) {
      params = params.set('id', id);
    }
    if (customerName) {
      params = params.set('customerName', customerName);
    }
    return this.http.get<ApiResponse<CustomerDetailsResponse>>(url, { params });
  }

  deleteCustomer(id: string): Observable<ApiResponse<string>> {
    const url = `${this.baseUrl}${environment.customers.deleteCustomer(id)}`;
    return this.http.delete<ApiResponse<string>>(url);
  }

  updateCustomer(id: string, data: UpdateCustomerRequest): Observable<ApiResponse<string>> {
    const url = `${this.baseUrl}${environment.customers.updateCustomer}`;
    return this.http.put<ApiResponse<string>>(url, data, {
      params: { customerId: id },
    });
  }

  getSalesAgents(): Observable<ApiResponse<SalesAgentBrief[]>> {
    const url = `${this.baseUrl}${environment.salesAgents.getSalesAgentDropdown}`;
    return this.http.get<ApiResponse<SalesAgentBrief[]>>(url);
  }

  exportCustomers(customerIds: string[]): Observable<Blob> {
    const url = `${this.baseUrl}${environment.customers.exportCustomers}`;
    return this.http.post<Blob>(url, { customerIds }, { responseType: 'blob' as 'json' });
  }

  getStatistics(): Observable<ApiResponse<CustomersStatistics>> {
    const url = `${this.baseUrl}${environment.statistics.getCustomerStatistics}`;
    return this.http.get<ApiResponse<CustomersStatistics>>(url);
  }

  importCustomers(file: FormData): Observable<ApiResponse<boolean>> {
    const url = `${this.baseUrl}${environment.customers.importCustomers}`;
    return this.http.post<ApiResponse<boolean>>(url, file);
  }
}
