export interface GetAgentDetailsResponse {
  id: string;
  email: string;
  fullName: string;
  monthlyTarget: number;
  managerId: string;
  managerName: string;
  isActive: boolean;
  dateCreated: string;
  assignedLeadsCount: number;
  assignedCustomersCount: number;
}
