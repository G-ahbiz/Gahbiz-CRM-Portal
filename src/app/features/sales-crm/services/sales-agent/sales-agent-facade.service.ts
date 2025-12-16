import { Injectable } from '@angular/core';
import { SalesAgentApiService } from './sales-agent-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesAgentFacadeService {
  constructor(private salesAgentApiService: SalesAgentApiService) {}

  getSalesAgentStatistics(): Observable<ApiResponse<SalesAgentStatistics>> {
    return this.salesAgentApiService.getSalesAgentStatistics();
  }
}
