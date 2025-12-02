export interface GetInvoiceetails {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  amountPaid: number;
  dueAmount: number;
  deliveryAddress: string;
  deliveryState: string;
  deliveryPostalCode: string;
  paymentMethod: string;
  businessName: string;
  expirationDate: string | null;
  assignedSalesAgentId: string;
  notes: string;
  services: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
}
