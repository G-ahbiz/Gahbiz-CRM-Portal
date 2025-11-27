export interface GetCustomersFilters {
  days?: number;
  pageNumber?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'ASC' | 'DESC';
}
