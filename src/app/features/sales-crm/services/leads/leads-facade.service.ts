import { inject, Injectable } from '@angular/core';
import { LeadsApiService } from './leads-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { LeadSummary, LeadSummaryItem } from '@features/sales-crm/interfaces/lead-summary';
import { Observable } from 'rxjs';
import { AddLeadRequest } from '@features/sales-crm/interfaces/add-lead-request';
import { PaginatedServices } from '@features/sales-crm/interfaces/paginated-services';
import { ServiceDetails } from '@features/sales-crm/interfaces/service-details';

@Injectable({
  providedIn: 'root',
})
export class LeadsFacadeService {
  private readonly leadsService = inject(LeadsApiService);

  getAllLeads(
    pageNumber: number = 1,
    pageSize: number = 10,
    assignedTo: string = '',
    sortColumn: string = '',
    sortDirection: string = 'ASC'
  ): Observable<ApiResponse<LeadSummary>> {
    return this.leadsService.getAllLeads(
      pageNumber,
      pageSize,
      assignedTo,
      sortColumn,
      sortDirection
    );
  }

  searchLeads(
    pageNumber: number = 1,
    pageSize: number = 10,
    query: string = ''
  ): Observable<ApiResponse<LeadSummary>> {
    return this.leadsService.searchLeads(pageNumber, pageSize, query);
  }

  addLead(addLeadRequest: AddLeadRequest | FormData): Observable<ApiResponse<LeadSummaryItem>> {
    console.log(addLeadRequest);
    return this.leadsService.addLead(addLeadRequest);
  }

  deleteLead(id: string): Observable<ApiResponse<any>> {
    return this.leadsService.deleteLead(id);
  }

  exportLeads(leadIds: string[]): Observable<Blob> {
    return this.leadsService.exportLeads(leadIds);
  }
  importLeads(file: FormData): Observable<ApiResponse<any>> {
    return this.leadsService.importLeads(file);
  }

  getAllServices(): Observable<ApiResponse<PaginatedServices>> {
    return this.leadsService.getAllServices();
  }
  searchServices(text: string): Observable<ApiResponse<ServiceDetails[]>> {
    return this.leadsService.searchServices(text);
  }
}
