import { inject, Injectable } from '@angular/core';
import { LeadsApiService } from './leads-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { LeadSummary } from '@features/sales-crm/interfaces/lead-summary';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadsFacadeService {
  private readonly leadsService = inject(LeadsApiService);

  getAllLeads(
    pageNumber: number = 1,
    pageSize: number = 10,
    assignedTo: string = ''
  ): Observable<ApiResponse<LeadSummary>> {
    return this.leadsService.getAllLeads(pageNumber, pageSize, assignedTo);
  }
}
