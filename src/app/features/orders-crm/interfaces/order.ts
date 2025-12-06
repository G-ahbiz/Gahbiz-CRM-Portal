export interface OrderItem {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdDate: string;
  address: string;

  selected?: boolean;
  [key: string]: any;
}

export interface CRMOrderRequestParams {
  pageNumber?: number;
  pageSize?: number;
  lastDays?: number;
  searchTerm?: string;

  
  sortColumn?: string;
  sortDirection?: string;
}
