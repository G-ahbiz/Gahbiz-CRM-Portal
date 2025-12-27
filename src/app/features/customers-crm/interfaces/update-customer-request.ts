export interface UpdateCustomerRequest {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  country: string;
  state: string;
  postalCode: string;
  address: string;
  ssn?: string;
}