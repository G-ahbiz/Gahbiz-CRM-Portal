export interface AssignTaskResponse {
  taskId: string;
  leadId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: Date;
  createdDate: Date;
}
