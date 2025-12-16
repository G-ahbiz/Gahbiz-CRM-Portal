export interface GetSalesAgentsResponse {
  agentId: string;
  name: string;
  profileImage: string;
  role: string;
  isActive: boolean;
  totalLeads: number;
  convertedLeads: number;
  onHoldLeads: number;
}
