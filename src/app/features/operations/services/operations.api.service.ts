import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ServiceSubmission } from '../interfaces/get-all-submissions-response';
import { Observable } from 'rxjs';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { ApiResponse } from '@core/interfaces/api-response';
import { GetSubmissionsFilters } from '../interfaces/get-submissions-filters';
import { GetSubmissionDetails } from '../interfaces/get-submission-details';

@Injectable({
  providedIn: 'root',
})
export class OperationsApiService {
  private readonly baseUrl = environment.baseApi;
  private readonly http = inject(HttpClient);

  getAllServiceSubmissions(
    filters: GetSubmissionsFilters
  ): Observable<ApiResponse<PagenatedResponse<ServiceSubmission>>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }
    if (filters.createdDateFrom) {
      params = params.set('createdDateFrom', filters.createdDateFrom);
    }
    if (filters.createdDateTo) {
      params = params.set('createdDateTo', filters.createdDateTo);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<ApiResponse<PagenatedResponse<ServiceSubmission>>>(
      `${this.baseUrl}${environment.operations.getAllServiceSubmissions}`,
      { params }
    );
  }

  getSubmissionDetails(id: string): Observable<ApiResponse<GetSubmissionDetails>> {
    return this.http.get<ApiResponse<GetSubmissionDetails>>(
      `${this.baseUrl}${environment.operations.getServiceSubmission(id)}`
    );
  }

  requestEdit(
    clientServiceId: string,
    requests: { editRequests: { serviceFileId: string; comment: string }[] }
  ): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}${environment.operations.requestEdit(clientServiceId)}`,
      requests
    );
  }

  acceptSubmission(submissionId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}${environment.operations.acceptSubmission(submissionId)}`,
      null
    );
  }

  rejectSubmission(submissionId: string, rejectionReason: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}${environment.operations.rejectServiceSubmission(submissionId)}`,
      { rejectionReason: rejectionReason }
    );
  }
}
