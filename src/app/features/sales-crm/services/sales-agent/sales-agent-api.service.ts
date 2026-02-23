import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { environment } from '@env/environment';
import { SalesAgentBrief } from '@features/customers-crm/interfaces/sales-agent-brief';
import { AddSalesAgentRequest } from '@features/sales-crm/interfaces/add-sales-agent-request';
import { AddSalesAgentResponse } from '@features/sales-crm/interfaces/add-sales-agent-response';
import { AssignTaskResponse } from '@features/sales-crm/interfaces/assign-task-response';
import { EditAgentRequest } from '@features/sales-crm/interfaces/edit-agent-request';
import { GetAgentDetailsResponse } from '@features/sales-crm/interfaces/get-agent-details';
import { GetSalesAgentsResponse } from '@features/sales-crm/interfaces/get-sales-agents-response';
import { LeadSummary } from '@features/sales-crm/interfaces/lead-summary';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';
import { SalesAgentStatisticsOne } from '@features/sales-crm/interfaces/sales-agent-statistics-one';
import { SalesAgentsFilter } from '@features/sales-crm/interfaces/sales-agents-filters';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesAgentApiService {
  baseUrl = `${environment.baseApi}`;

  constructor(private http: HttpClient) {}

  getSalesAgentStatistics(): Observable<ApiResponse<SalesAgentStatistics>> {
    const url = `${this.baseUrl}${environment.statistics.getSalesAgentStatistics}`;
    return this.http.get<ApiResponse<SalesAgentStatistics>>(url);
  }

  getAllSalesAgents(
    filters: SalesAgentsFilter,
  ): Observable<ApiResponse<PagenatedResponse<GetSalesAgentsResponse>>> {
    const url = `${this.baseUrl}${environment.salesAgents.getSalesAgents}`;

    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }
    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }
    return this.http.get<ApiResponse<PagenatedResponse<GetSalesAgentsResponse>>>(url, { params });
  }

  getSalesAgentDetails(agentId: string): Observable<ApiResponse<GetAgentDetailsResponse>> {
    const url = `${this.baseUrl}${environment.salesAgents.getSalesAgent(agentId)}`;
    return this.http.get<ApiResponse<GetAgentDetailsResponse>>(url);
  }

  updateSalesAgent(
    agentId: string,
    request: EditAgentRequest,
  ): Observable<ApiResponse<GetAgentDetailsResponse>> {
    const url = `${this.baseUrl}${environment.salesAgents.updateSalesAgent(agentId)}`;
    return this.http.put<ApiResponse<GetAgentDetailsResponse>>(url, request);
  }

  deleteSalesAgent(agentId: string): Observable<ApiResponse<boolean>> {
    const url = `${this.baseUrl}${environment.salesAgents.deleteSalesAgent(agentId)}`;
    return this.http.delete<ApiResponse<boolean>>(url);
  }

  getSalesAgentsDropdown(): Observable<ApiResponse<SalesAgentBrief[]>> {
    const url = `${this.baseUrl}${environment.salesAgents.getSalesAgentDropdown}`;
    return this.http.get<ApiResponse<SalesAgentBrief[]>>(url);
  }

  assignTask(request: FormData): Observable<ApiResponse<AssignTaskResponse>> {
    const url = `${this.baseUrl}${environment.salesAgents.assignTask}`;
    return this.http.post<ApiResponse<AssignTaskResponse>>(url, request);
  }

  getSalesAgentStatisticsById(agentId: string): Observable<ApiResponse<SalesAgentStatisticsOne>> {
    const url = `${this.baseUrl}${environment.salesAgents.getSalesAgentStatistics(agentId)}`;
    return this.http.get<ApiResponse<SalesAgentStatisticsOne>>(url);
  }

  getLeadsBySalesAgentId(
    agentId: string,
    params: SalesAgentsFilter,
  ): Observable<ApiResponse<LeadSummary>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<ApiResponse<LeadSummary>>(
      `${this.baseUrl}${environment.salesAgents.getLeadsBySalesAgentId(agentId)}`,
      {
        params: httpParams,
      },
    );
  }

  getManagersDropdown(): Observable<ApiResponse<SalesAgentBrief[]>> {
    const url = `${this.baseUrl}${environment.salesAgents.getManagersDropdown}`;
    return this.http.get<ApiResponse<SalesAgentBrief[]>>(url);
  }

  addSalesAgent(request: AddSalesAgentRequest): Observable<ApiResponse<AddSalesAgentResponse>> {
    const url = `${this.baseUrl}${environment.salesAgents.addSalesAgent}`;
    return this.http.post<ApiResponse<AddSalesAgentResponse>>(url, request);
  }
}
