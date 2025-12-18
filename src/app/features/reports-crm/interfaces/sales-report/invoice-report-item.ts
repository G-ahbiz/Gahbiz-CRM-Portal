export interface InvoiceReportItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  dueAmount: number;
  status: 'Paid' | 'Unpaid' | 'PartiallyPaid';
}
