import { ServiceDetails } from './service-details';

export interface PaginatedServices {
  items: ServiceDetails[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
