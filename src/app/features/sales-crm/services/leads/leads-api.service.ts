import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LeadSummary } from '../../interfaces/lead-summary';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment.development';

@Injectable({
  providedIn: 'root',
})
export class LeadsApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseApi = `${environment.baseApi}`;
  getAllLeads(
    pageNumber: number = 1,
    pageSize: number = 10,
    assignedTo: string = ''
  ): Observable<ApiResponse<LeadSummary>> {
    const getLeadsUrl = `${this.baseApi}${environment.leads.getLeads}`;
    return this.httpClient.get<ApiResponse<LeadSummary>>(getLeadsUrl, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        assignedTo: assignedTo ? assignedTo : '',
      },
    });
  }

  deleteLead(id: string): Observable<ApiResponse<any>> {
    const deleteLeadUrl = `${this.baseApi}${environment.leads.deleteLead(id)}`;
    return this.httpClient.delete<ApiResponse<any>>(deleteLeadUrl);
  }
}
