import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { AddCustomerRequest } from '../interfaces/add-customer-request';
import { ApiResponse } from '@core/interfaces/api-response';
import { Observable } from 'rxjs';
import { GetSalesAgentsResponse } from '../interfaces/get-sales-agents-response';
import { GetCustomersResponse } from '../interfaces/get-customers-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetCustomersFilters } from '../interfaces/get-customers-filters';
import { CustomerDetailsResponse } from '../interfaces/customer-details-response';

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
    filters: GetCustomersFilters
  ): Observable<PagenatedResponse<GetCustomersResponse>> {
    const url = `${this.baseUrl}${environment.customers.getAllCustomers}`;
    return this.http.get<PagenatedResponse<GetCustomersResponse>>(url, {
      params: {
        pageNumber: filters.pageNumber ?? '',
        pageSize: filters.pageSize ?? '',
        sortColumn: filters.sortColumn ?? '',
        sortDirection: filters.sortDirection ?? '',
        days: filters.days ?? '',
      },
    });
  }

  getCustomerDetails(
    id?: string,
    customerName?: string
  ): Observable<ApiResponse<CustomerDetailsResponse>> {
    const url = `${this.baseUrl}${environment.customers.getCustomer}`;
    return this.http.get<ApiResponse<CustomerDetailsResponse>>(url, {
      params: {
        id: id ?? '',
        customerName: customerName ?? '',
      },
    });
  }

  deleteCustomer(id: string): Observable<ApiResponse<string>> {
    const url = `${this.baseUrl}${environment.customers.deleteCustomer(id)}`;
    return this.http.delete<ApiResponse<string>>(url);
  }

  getSalesAgents(): Observable<ApiResponse<GetSalesAgentsResponse[]>> {
    const url = `${this.baseUrl}${environment.customers.getSalesAgents}`;
    return this.http.get<ApiResponse<GetSalesAgentsResponse[]>>(url);
  }
}
