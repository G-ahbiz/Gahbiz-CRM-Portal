export interface AddSalesAgentResponse {
  id: string;
  email: string;
  fullName: string;
  managerId?: string;
  dateCreated: Date;
  isActive: boolean;
  monthlyTarget?: number;
}
