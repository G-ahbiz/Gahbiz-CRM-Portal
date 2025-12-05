export interface AddLeadRequest {
  parentId?: string;
  firstName: string;
  lastName: string;
  eMail: string;
  phone: string;
  ssn?: string;
  currentCity?: string;
  fromCity?: string;
  dob?: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  source?: 'FacebookAds' | 'GoogleAds' | 'Referral' | 'WebsiteForm' | 'TradeShow' | 'Manual' | 'Provider';
  servicesOfInterest?: string[];
  zipCode?: string;
  city?: string;
  state?: string;
  county?: string;
  gender?: string;
  workAt?: string;
  notes?: string;
}
