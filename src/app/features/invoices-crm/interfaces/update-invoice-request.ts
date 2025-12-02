export interface UpdateInvoiceRequest {
  amountPaid: number;
  status: 'Unpaid' | 'PartiallyPaid' | 'Paid';
  notes?: string;
}
