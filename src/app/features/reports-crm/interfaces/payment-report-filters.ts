export interface PaymentReportFilters {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  paymentMethod?: 'CashOnDelivery' | 'BankTransfer' | 'CreditCard' | 'Paypal';
  period:
    | 'AllTime'
    | 'ThisMonth'
    | 'LastMonth'
    | 'ThisYear'
    | 'LastYear'
    | 'Last3Months'
    | 'Last6Months'
    | 'Last12Months'
    | 'Period';
  fromDate?: string;
  toDate?: string;
}
