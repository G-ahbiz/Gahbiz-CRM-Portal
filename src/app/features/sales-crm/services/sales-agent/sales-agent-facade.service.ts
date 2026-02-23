import { Injectable } from '@angular/core';
import { SalesAgentApiService } from './sales-agent-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';
import { Observable } from 'rxjs';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetSalesAgentsResponse } from '@features/sales-crm/interfaces/get-sales-agents-response';
import { SalesAgentsFilter } from '@features/sales-crm/interfaces/sales-agents-filters';
import { AssignTaskResponse } from '@features/sales-crm/interfaces/assign-task-response';
import { SalesAgentStatisticsOne } from '@features/sales-crm/interfaces/sales-agent-statistics-one';
import { LeadSummary } from '@features/sales-crm/interfaces/lead-summary';
import { SalesAgentBrief } from '@features/customers-crm/interfaces/sales-agent-brief';
import { AddSalesAgentRequest } from '@features/sales-crm/interfaces/add-sales-agent-request';
import { AddSalesAgentResponse } from '@features/sales-crm/interfaces/add-sales-agent-response';
import { GetAgentDetailsResponse } from '@features/sales-crm/interfaces/get-agent-details';
import { EditAgentRequest } from '@features/sales-crm/interfaces/edit-agent-request';

@Injectable({
  providedIn: 'root',
})
export class SalesAgentFacadeService {
  constructor(private salesAgentApiService: SalesAgentApiService) {}

  getSalesAgentStatistics(): Observable<ApiResponse<SalesAgentStatistics>> {
    return this.salesAgentApiService.getSalesAgentStatistics();
  }

  getAllSalesAgents(
    filters: SalesAgentsFilter,
  ): Observable<ApiResponse<PagenatedResponse<GetSalesAgentsResponse>>> {
    return this.salesAgentApiService.getAllSalesAgents(filters);
  }

  getSalesAgentDetails(agentId: string): Observable<ApiResponse<GetAgentDetailsResponse>> {
    return this.salesAgentApiService.getSalesAgentDetails(agentId);
  }

  updateSalesAgent(
    agentId: string,
    request: EditAgentRequest,
  ): Observable<ApiResponse<GetAgentDetailsResponse>> {
    return this.salesAgentApiService.updateSalesAgent(agentId, request);
  }

  deleteSalesAgent(agentId: string): Observable<ApiResponse<boolean>> {
    return this.salesAgentApiService.deleteSalesAgent(agentId);
  }
  assignTask(request: FormData): Observable<ApiResponse<AssignTaskResponse>> {
    return this.salesAgentApiService.assignTask(request);
  }

  getSalesAgentStatisticsById(agentId: string): Observable<ApiResponse<SalesAgentStatisticsOne>> {
    return this.salesAgentApiService.getSalesAgentStatisticsById(agentId);
  }

  getLeadsBySalesAgentId(
    agentId: string,
    filter: SalesAgentsFilter,
  ): Observable<ApiResponse<LeadSummary>> {
    return this.salesAgentApiService.getLeadsBySalesAgentId(agentId, filter);
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
