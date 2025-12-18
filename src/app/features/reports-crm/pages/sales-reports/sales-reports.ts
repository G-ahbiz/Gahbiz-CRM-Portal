import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { PaymentTable } from '@features/reports-crm/components/sales/payment-table/payment-table';

@Component({
  selector: 'app-sales-reports',
  imports: [CommonModule, PaymentTable],
  templateUrl: './sales-reports.html',
  styleUrl: './sales-reports.css',
})
export class SalesReports {
  activeTab = signal<'payments' | 'customers' | 'invoices'>('payments');
}
