import { inject, Injectable } from '@angular/core';
import { LeadsApiService } from './leads-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { LeadSummary, LeadSummaryItem } from '@features/sales-crm/interfaces/lead-summary';
import { Observable } from 'rxjs';
import { AddLeadRequest } from '@features/sales-crm/interfaces/add-lead-request';
import { PaginatedServices } from '@features/sales-crm/interfaces/paginated-response';
import { ServiceDetails } from '@features/sales-crm/interfaces/service-details';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';
import { CreateActivityRequest } from '@features/sales-crm/interfaces/create-activity-request';
import { LeadsStatistics } from '@features/sales-crm/interfaces/leads-statistics';

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

  updateLead(
    id: string,
    addLeadRequest: AddLeadRequest | FormData
  ): Observable<ApiResponse<LeadSummaryItem>> {
    return this.leadsService.updateLead(id, addLeadRequest);
  }

  getLeadById(id: string): Observable<ApiResponse<LeadDetails>> {
    return this.leadsService.getLeadById(id);
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

  getStatistics(): Observable<ApiResponse<LeadsStatistics>> {
    return this.leadsService.getStatistics();
  }

  // ===================================================

  getLeadActivities(id: string): Observable<ApiResponse<any>> {
    return this.leadsService.getLeadActivities(id);
  }

  createActivity(activityDto: CreateActivityRequest): Observable<ApiResponse<any>> {
    return this.leadsService.createActivity(activityDto);
  }
}
