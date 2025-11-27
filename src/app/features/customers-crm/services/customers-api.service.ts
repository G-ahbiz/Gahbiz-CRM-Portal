import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { AddCustomerRequest } from '../interfaces/add-customer-request';
import { ApiResponse } from '@core/interfaces/api-response';
import { Observable } from 'rxjs';
import { GetSalesAgentsResponse } from '../interfaces/get-sales-agents-response';

@Injectable({
  providedIn: 'root',
})
export class CustomersApiService {
  readonly baseUrl = environment.baseApi;
  private http = inject(HttpClient);

  addCustomer(customer: FormData): Observable<ApiResponse<string>> {
    console.log('customer', customer);
    const url = `${this.baseUrl}${environment.customers.addCustomer}`;
    return this.http.post<ApiResponse<string>>(url, customer);
  }

  getSalesAgents(): Observable<ApiResponse<GetSalesAgentsResponse[]>> {
    const url = `${this.baseUrl}${environment.customers.getSalesAgents}`;
    return this.http.get<ApiResponse<GetSalesAgentsResponse[]>>(url);
  }
}
