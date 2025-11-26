export interface SalesAgents {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  assignedTo: string;
  selected?: boolean;
}
