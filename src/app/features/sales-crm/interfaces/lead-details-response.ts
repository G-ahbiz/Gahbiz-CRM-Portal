export interface LeadDetailsResponse {
  id: string;
  parentId?: string;
  firstName: string;
  lastName: string;
  eMail: string;
  phone: string;
  ssn?: string;
  currentCity?: string;
  fromCity?: string;
  userId?: string;
  dob?: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  source?: string;
  servicesOfInterest?: string[];
  zipCode?: string;
  city?: string;
  state?: string;
  county?: string;
  gender?: string;
  workAt?: string;
  sourceName?: string;
  notes?: string;
}
