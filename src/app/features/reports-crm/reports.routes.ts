import { Routes } from '@angular/router';
import { SalesReports } from './pages/sales-reports/sales-reports';
import { LeadsReports } from './pages/leads-reports/leads-reports';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'sales',
    loadComponent: () => import('./pages/sales-reports/sales-reports').then((m) => SalesReports),
    children: [
      {
        path: 'payment',
        loadComponent: () =>
          import('./components/sales/payment-table/payment-table').then((m) => m.PaymentTable),
      },
      {
        path: 'customer',
        loadComponent: () =>
          import('./components/sales/customer-table/customer-table').then((m) => m.CustomerTable),
      },
      {
        path: 'invoice',
        loadComponent: () =>
          import('./components/sales/invoice-table/invoice-table').then((m) => m.InvoiceTable),
      }
    ],
  },
  {
    path: 'leads',
    loadComponent: () => import('./pages/leads-reports/leads-reports').then((m) => LeadsReports),
    children: [],
  },
];
