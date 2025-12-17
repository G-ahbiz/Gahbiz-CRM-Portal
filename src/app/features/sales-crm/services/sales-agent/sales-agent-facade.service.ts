import { Injectable } from '@angular/core';
import { SalesAgentApiService } from './sales-agent-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';
import { Observable } from 'rxjs';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetSalesAgentsResponse } from '@features/sales-crm/interfaces/get-sales-agents-response';
import { SalesAgentsFilter } from '@features/sales-crm/interfaces/sales-agents-filters';
import { AssignTaskResponse } from '@features/sales-crm/interfaces/assign-task-response';
import { SalesAgentBrief } from '@features/customers-crm/interfaces/sales-agent-brief';
import { AddSalesAgentRequest } from '@features/sales-crm/interfaces/add-sales-agent-request';
import { AddSalesAgentResponse } from '@features/sales-crm/interfaces/add-sales-agent-response';

@Injectable({
  providedIn: 'root',
})
export class SalesAgentFacadeService {
  constructor(private salesAgentApiService: SalesAgentApiService) {}

  getSalesAgentStatistics(): Observable<ApiResponse<SalesAgentStatistics>> {
    return this.salesAgentApiService.getSalesAgentStatistics();
  }

  getAllSalesAgents(
    filters: SalesAgentsFilter
  ): Observable<ApiResponse<PagenatedResponse<GetSalesAgentsResponse>>> {
    return this.salesAgentApiService.getAllSalesAgents(filters);
  }

  assignTask(request: FormData): Observable<ApiResponse<AssignTaskResponse>> {
    return this.salesAgentApiService.assignTask(request);
  }

  getSalesAgentsDropdown(): Observable<ApiResponse<SalesAgentBrief[]>> {
    return this.salesAgentApiService.getSalesAgentsDropdown();
  }
  getManagersDropdown(): Observable<ApiResponse<SalesAgentBrief[]>> {
    return this.salesAgentApiService.getManagersDropdown();
  }

  addSalesAgent(request: AddSalesAgentRequest): Observable<ApiResponse<AddSalesAgentResponse>> {
    return this.salesAgentApiService.addSalesAgent(request);
  }
}
