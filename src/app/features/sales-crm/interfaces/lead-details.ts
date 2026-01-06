import { AssignedTo } from './lead-summary';

export interface LeadDetails {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string; 
  value: number;
  servicesOfInterest: ServiceOfInterest[];
  status: string;
  sourceName: string;
  assignedTo: AssignedTo | null;
  createdAt: string;
  updatedAt: string | null;
  ssn: string;
  currentCity: string;
  fromCity: string;
  dob: string;
  zipCode: string;
  city: string;
  state: string;
  county: string;
  country: string;
  gender: string;
  workAt: string;
  parentId: string | null;
}

export interface ServiceOfInterest {
  id: string;
  name: string;
}
