export interface LeadsFilters {
  status?: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  fromCity?: string;
  sourceName?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  pageNumber?: number;
  pageSize?: number;
  sortColumn?:
    | 'Status'
    | 'SourceName'
    | 'AssignedTo'
    | 'UpdatedAt'
    | 'CreatedDate'
    | 'FromCity'
    | 'FirstName'
    | 'LastName';
  sortDirection?: 'ASC' | 'DESC';
}
