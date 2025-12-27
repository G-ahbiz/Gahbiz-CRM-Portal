export interface AddCustomerRequest {
  FullName: string;
  Email: string;
  Phone: string;
  Gender: string;
  Country: string;
  State: string;
  PostalCode: string;
  Address: string;
  SSN?: string;
  DefaultLanguage: string;
  AssignedAgentId: string;
}
