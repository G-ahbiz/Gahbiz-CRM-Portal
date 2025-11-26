import { inject, Injectable } from '@angular/core';
import { AddCustomerRequest } from '../interfaces/add-customer-request';
import { ApiResponse } from '@core/interfaces/api-response';
import { CustomersApiService } from './customers-api.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { GetSalesAgentsResponse } from '../interfaces/get-sales-agents-response';

@Injectable({
  providedIn: 'root',
})
export class CustomersFacadeService {
  private customerService = inject(CustomersApiService);

  addCustomer(customer: FormData): Observable<ApiResponse<string>> {
    console.log('customer', customer);
    return this.customerService.addCustomer(customer);
  }

  getSalesAgents(): Observable<ApiResponse<GetSalesAgentsResponse[]>> {
    return this.customerService.getSalesAgents();
  }
}
