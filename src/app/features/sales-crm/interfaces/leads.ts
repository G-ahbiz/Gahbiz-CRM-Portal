export interface Leads {
  id: number;
  name: string;
  service: string;
  status: string;
  source: string;
  assignedTo: string;
  value: string;
  createdDate: string;
  selected?: boolean;
}
