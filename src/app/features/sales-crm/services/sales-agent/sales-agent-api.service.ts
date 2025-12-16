import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';
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
}
