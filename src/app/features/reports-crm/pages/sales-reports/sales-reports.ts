import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { PaymentTable } from '@features/reports-crm/components/sales/payment-table/payment-table';
import { InvoiceTable } from '@features/reports-crm/components/sales/invoice-table/invoice-table';
import { CustomerTable } from '@features/reports-crm/components/sales/customer-table/customer-table';

@Component({
  selector: 'app-sales-reports',
  imports: [CommonModule, PaymentTable, CustomerTable, InvoiceTable],
  templateUrl: './sales-reports.html',
  styleUrl: './sales-reports.css',
})
export class SalesReports {
  activeTab = signal<'payments' | 'customers' | 'invoices'>('payments');
}
