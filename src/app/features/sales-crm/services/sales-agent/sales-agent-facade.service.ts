import { Injectable } from '@angular/core';
import { SalesAgentApiService } from './sales-agent-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';
import { Observable } from 'rxjs';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetSalesAgentsResponse } from '@features/sales-crm/interfaces/get-sales-agents-response';
import { SalesAgentsFilter } from '@features/sales-crm/interfaces/sales-agents-filters';
import { AssignTaskResponse } from '@features/sales-crm/interfaces/assign-task-response';

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
}
