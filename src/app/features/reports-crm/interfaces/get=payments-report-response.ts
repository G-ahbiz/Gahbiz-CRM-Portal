export interface GetPaymentsReportResponse {
  paymentId: string;
  invoiceId: string;
  paymentDate: string;
  customerName: string;
  paymentMode: string;
  transactionId: string | null;
  note: string;
  amount: number;
}
