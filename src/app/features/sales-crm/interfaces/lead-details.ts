import { AssignedTo } from './lead-summary'

export interface LeadDetails {
  id: string;
  firstName?: string | null;
  lastName?: string | null;

  email?: string | null;
  phoneNumber?: string | null;

  assignedTo: AssignedTo | null;

  status?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;

  value?: number | null;
  sourceName?: string | null;

  servicesOfInterest?: ServiceOfInterest[] | string[] | null;
}

export interface ServiceOfInterest {
  id: string;
  name: string;
}
