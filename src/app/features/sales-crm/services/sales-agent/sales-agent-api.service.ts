import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { environment } from '@env/environment';
import { AssignTaskResponse } from '@features/sales-crm/interfaces/assign-task-response';
import { GetSalesAgentsResponse } from '@features/sales-crm/interfaces/get-sales-agents-response';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';
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
    filters: SalesAgentsFilter
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

  assignTask(request: FormData): Observable<ApiResponse<AssignTaskResponse>> {
    const url = `${this.baseUrl}${environment.salesAgents.assignTask}`;
    return this.http.post<ApiResponse<AssignTaskResponse>>(url, request);
  }
}
