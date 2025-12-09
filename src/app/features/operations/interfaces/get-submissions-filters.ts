import { SubmissionStatus } from './get-all-submissions-response';

export interface GetSubmissionsFilters {
  pageNumber: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: 'ASC' | 'DESC';
  createdDateFrom?: string;
  createdDateTo?: string;
  status?: SubmissionStatus;
}
