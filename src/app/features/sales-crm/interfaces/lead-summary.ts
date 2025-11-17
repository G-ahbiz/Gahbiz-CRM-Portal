export interface LeadSummary {
  items: LeadSummaryItem[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface LeadSummaryItem {
  id: number;
  firstName: string;
  lasttName: string;
  servicesOfInterest: string[];
  status: string;
  sourceName: string;
  assignedTo: string;
  creadtedAt: string;
  updatedAt: string;
  selected?: boolean;
}
