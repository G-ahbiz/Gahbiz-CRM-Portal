export interface AssignTaskRequest {
  leadId: string;
  note: string;
  status: 'Created' | 'Delayed' | 'Cancelled' | 'Closed';
  assigneeId: string;
  dueDate: string;
}
