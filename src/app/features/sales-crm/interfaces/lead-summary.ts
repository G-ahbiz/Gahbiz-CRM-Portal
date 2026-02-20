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
  lastName: string;
  status: string;
  sourceName: string;
  assignedTo?: AssignedTo;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
  servicesOfInterest: {
    id: string;
    name: string;
  }[];
  selected?: boolean;
}

export interface AssignedTo {
  id: string;
  fullName: string;
}
