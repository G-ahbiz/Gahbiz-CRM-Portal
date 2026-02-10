import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { CustomersApiService } from './customers-api.service';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { SalesAgentBrief } from '../interfaces/sales-agent-brief';
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
    filters: GetCustomersFilters,
  ): Observable<PagenatedResponse<GetCustomersResponse>> {
    return this.customerService.getAllCustomers(filters);
  }

  getCustomer(
    id?: string,
    customerName?: string,
  ): Observable<ApiResponse<CustomerDetailsResponse>> {
    return this.customerService.getCustomer(id, customerName);
  }

  getCustomerDetails(
    id?: string,
    customerName?: string,
  ): Observable<ApiResponse<CustomerDetailsResponse>> {
    return this.customerService.getCustomerDetails(id, customerName);
  }

  updateCustomer(id: string, data: UpdateCustomerRequest): Observable<ApiResponse<string>> {
    return this.customerService.updateCustomer(id, data);
  }

  deleteCustomer(id: string): Observable<ApiResponse<string>> {
    return this.customerService.deleteCustomer(id);
  }

  deleteMultipleCustomers(
    ids: string[],
  ): Observable<{ succeeded: string[]; failed: { id: string; error: any }[] }> {
    if (ids.length === 0) {
      return of({ succeeded: [], failed: [] });
    }

    const deleteRequests = ids.map((id) =>
      this.deleteCustomer(id).pipe(
        map((response) => ({
          id,
          response,
          success: true,
          error: null,
        })),
        catchError((error) =>
          of({
            id,
            response: null,
            success: false,
            error,
          }),
        ),
      ),
    );

    return forkJoin(deleteRequests).pipe(
      map((results) => {
        const succeeded: string[] = [];
        const failed: { id: string; error: any }[] = [];

        results.forEach((result) => {
          if (result.success && result.response?.succeeded) {
            succeeded.push(result.id);
          } else {
            failed.push({
              id: result.id,
              error: result.error || result.response?.message || 'Unknown error',
            });
          }
        });

        return { succeeded, failed };
      }),
    );
  }

  getSalesAgents(): Observable<ApiResponse<SalesAgentBrief[]>> {
    return this.customerService.getSalesAgents();
  }

  exportCustomers(customerIds: string[]): Observable<Blob> {
    return this.customerService.exportCustomers(customerIds);
  }

  getStatistics(): Observable<ApiResponse<CustomersStatistics>> {
    return this.customerService.getStatistics();
  }

  importCustomers(file: FormData): Observable<ApiResponse<boolean>> {
    return this.customerService.importCustomers(file);
  }
}
