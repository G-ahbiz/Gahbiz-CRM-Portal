export interface AddInvoiceRequest {
  customerId: string;
  dueDate: string;
  notes: string;
  assignedSalesAgentId: string;
  invoiceNumber: string;
  items: {
    serviceId: string;
    quantity: number;
  }[];
}
