export interface AddSalesAgentRequest {
  email: string;
  password: string;
  fullName: string;
  MonthlyTarget: number;
  managerId?: string;
}
