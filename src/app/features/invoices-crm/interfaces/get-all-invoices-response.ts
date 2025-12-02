export interface GetAllInvoicesResponse {
  id: number;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  amountPaid: number;
  dueAmount: number;
  status: string;
}
