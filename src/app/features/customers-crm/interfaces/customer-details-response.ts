import { LeadDetailsResponse } from '@features/sales-crm/interfaces/lead-details-response';

export interface CustomerDetailsResponse {
  id: string;
  firstName: string;
  lastName: string;
  eMail: string;
  phone: string;
  gender: string;
  ssn: string;
  address: string;
  state: string;
  postalCode: string;
  country: string;
  appUserId?: string;
  lead?: LeadDetailsResponse;
}
