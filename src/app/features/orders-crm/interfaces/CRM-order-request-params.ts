export interface CRMOrderRequestParams {
  pageNumber?: number;
  pageSize?: number;
  lastDays?: number;
  searchTerm?: string;


  sortColumn?: string;
  sortDirection?: string;
}
