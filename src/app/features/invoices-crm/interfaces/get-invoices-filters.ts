export interface GetInvoicesFilters {
  pageNumber?: number;
  pageSize?: number;
  search?: string; // only search by invoiceNumber | customerName
  status?: 'Unpaid' | 'PartiallyPaid' | 'Paid';
  lastDays?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
