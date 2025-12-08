import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { ServiceSubmission } from '../interfaces/get-all-submissions-response';
import { OperationsApiService } from './operations.api.service';
import { Observable } from 'rxjs';
import { GetSubmissionsFilters } from '../interfaces/get-submissions-filters';

@Injectable({
  providedIn: 'root',
})
export class OperationsFacadeService {
  private readonly operationsApiService = inject(OperationsApiService);

  getAllServiceSubmissions(
    filters: GetSubmissionsFilters
  ): Observable<ApiResponse<PagenatedResponse<ServiceSubmission>>> {
    return this.operationsApiService.getAllServiceSubmissions(filters);
  }
}
