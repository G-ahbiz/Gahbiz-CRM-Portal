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
import { CustomerDetailsResponse } from '../interfaces/customer-details-response';
import { UpdateCustomerRequest } from '../interfaces/update-customer-request';
import { CustomersStatistics } from '../interfaces/customers-statistics';

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
  ): Observable<ApiResponse<CustomerDetailsResponse>> {
    return this.customerService.getCustomerDetails(id, customerName);
  }

  updateCustomer(id: string, data: UpdateCustomerRequest): Observable<ApiResponse<string>> {
    return this.customerService.updateCustomer(id, data);
  }

  deleteCustomer(id: string): Observable<ApiResponse<string>> {
    return this.customerService.deleteCustomer(id);
  }
  getSalesAgents(): Observable<ApiResponse<GetSalesAgentsResponse[]>> {
    return this.customerService.getSalesAgents();
  }

  exportCustomers(customerIds: string[]): Observable<Blob> {
    return this.customerService.exportCustomers(customerIds);
  }

  getStatistics(): Observable<ApiResponse<CustomersStatistics>> {
    return this.customerService.getStatistics();
  }
}
