export interface SalesAgentsFilter {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: 'SucceededLeads' | 'OnHoldLeads' | 'TotalLeads';
  sortDirection?: 'ASC' | 'DESC';
}
