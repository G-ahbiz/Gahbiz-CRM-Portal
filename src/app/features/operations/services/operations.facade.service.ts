import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { ServiceSubmission } from '../interfaces/get-all-submissions-response';
import { OperationsApiService } from './operations.api.service';
import { Observable } from 'rxjs';
import { GetSubmissionsFilters } from '../interfaces/get-submissions-filters';
import { GetSubmissionDetails } from '../interfaces/get-submission-details';
import { SubmissionsStatistics } from '../interfaces/submissions-statistics';
import { ClientServiceStatus } from '@shared/config/constants';
import { UpdateStatusResponse } from '../interfaces/update-status-response';

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

  getSubmissionDetails(id: string): Observable<ApiResponse<GetSubmissionDetails>> {
    return this.operationsApiService.getSubmissionDetails(id);
  }
  requestEdit(
    submissionId: string,
    requests: { editRequests: { serviceFileId: string; comment: string }[] }
  ): Observable<ApiResponse<void>> {
    return this.operationsApiService.requestEdit(submissionId, requests);
  }

  acceptSubmission(submissionId: string): Observable<ApiResponse<any>> {
    return this.operationsApiService.acceptSubmission(submissionId);
  }
  rejectSubmission(submissionId: string, rejectionReason: string): Observable<ApiResponse<any>> {
    return this.operationsApiService.rejectSubmission(submissionId, rejectionReason);
  }

  getSubmissionsStatistics(): Observable<ApiResponse<SubmissionsStatistics>> {
    return this.operationsApiService.getSubmissionsStatistics();
  }

  updateStatus(
    clientServiceId: string,
    status: ClientServiceStatus,
    note: string
  ): Observable<ApiResponse<UpdateStatusResponse>> {
    return this.operationsApiService.updateStatus(clientServiceId, status, note);
  }
}
