import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LeadSummary, LeadSummaryItem } from '../../interfaces/lead-summary';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment.development';
import { AddLeadRequest } from '@features/sales-crm/interfaces/add-lead-request';

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
  addLead(addLeadRequest: AddLeadRequest | FormData): Observable<ApiResponse<LeadSummaryItem>> {
    const addLeadUrl = `${this.baseApi}${environment.leads.addLead}`;
    return this.httpClient.post<ApiResponse<LeadSummaryItem>>(addLeadUrl, addLeadRequest);
  }
  searchLeads(
    pageNumber: number = 1,
    pageSize: number = 10,
    query: string = ''
  ): Observable<ApiResponse<LeadSummary>> {
    const searchLeadsUrl = `${this.baseApi}${environment.leads.searchLeads}`;
    return this.httpClient.get<ApiResponse<LeadSummary>>(searchLeadsUrl, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        query: query ? query : '',
      },
    });
  }
  deleteLead(id: string): Observable<ApiResponse<any>> {
    const deleteLeadUrl = `${this.baseApi}${environment.leads.deleteLead(id)}`;
    return this.httpClient.delete<ApiResponse<any>>(deleteLeadUrl);
  }

  exportLeads(leadIds: string[]): Observable<Blob> {
    const exportLeadsUrl = `${this.baseApi}${environment.leads.exportLeads}`;
    return this.httpClient.post<Blob>(
      exportLeadsUrl,
      { leadIds },
      { responseType: 'blob' as 'json' }
    );
  }

  importLeads(ExcelFile: FormData): Observable<ApiResponse<any>> {
    console.log(ExcelFile.get('file'));
    const importLeadsUrl = `${this.baseApi}${environment.leads.importLeads}`;
    return this.httpClient.post<ApiResponse<any>>(importLeadsUrl, ExcelFile as FormData);
  }
}
