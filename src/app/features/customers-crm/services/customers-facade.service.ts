import { inject, Injectable } from '@angular/core';
import { AddCustomerRequest } from '../interfaces/add-customer-request';
import { ApiResponse } from '@core/interfaces/api-response';
import { CustomersApiService } from './customers-api.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { GetSalesAgentsResponse } from '../interfaces/get-sales-agents-response';
import { GetCustomersFilters } from '../interfaces/get-customers-filters';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetCustomersResponse } from '../interfaces/get-customers-response';
import { GetCustomerDetailsResponse } from '../interfaces/get-customer-details-response';

@Injectable({
  providedIn: 'root',
})
export class CustomersFacadeService {
  private customerService = inject(CustomersApiService);

  addCustomer(customer: FormData): Observable<ApiResponse<string>> {
    return this.customerService.addCustomer(customer);
  }

  getAllCustomers(
    filters: GetCustomersFilters
  ): Observable<PagenatedResponse<GetCustomersResponse>> {
    return this.customerService.getAllCustomers(filters);
  }

  getCustomerDetails(
    id?: string,
    customerName?: string
  ): Observable<ApiResponse<GetCustomerDetailsResponse>> {
    return this.customerService.getCustomerDetails(id, customerName);
  }

  deleteCustomer(id: string): Observable<ApiResponse<string>> {
    return this.customerService.deleteCustomer(id);
  }
  getSalesAgents(): Observable<ApiResponse<GetSalesAgentsResponse[]>> {
    return this.customerService.getSalesAgents();
  }
}
