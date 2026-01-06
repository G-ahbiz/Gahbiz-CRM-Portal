export interface AddInvoiceRequest {
  customerId: string;
  dueDate: string;
  notes: string;
  assignedSalesAgentId: string;
  invoiceNumber: string;
  orderId: string;
}
