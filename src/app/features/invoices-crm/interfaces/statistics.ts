export interface InvoicesStatistics {
  totalInvoices: number;
  totalChangePercentage: number;
  paidInvoices: number;
  paidChangePercentage: number;
  partiallyPaidInvoices: number;
  partiallyPaidChangePercentage: number;
  unpaidInvoices: number;
  unpaidChangePercentage: number;
}
