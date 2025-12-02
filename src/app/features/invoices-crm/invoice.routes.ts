import { Routes } from '@angular/router';

export const invoiceRoutes: Routes = [
  {
    path: 'invoice-main',
    loadComponent: () =>
      import('./components/invoice-content/invoice-content').then((m) => m.InvoiceContent),
  },
  {
    path: 'invoice-details',
    loadComponent: () =>
      import('./components/invoice-details/invoice-details').then((m) => m.InvoiceDetails),
  },
  {
    path: 'add-invoice',
    loadComponent: () => import('./components/add-invoice/add-invoice').then((m) => m.AddInvoice),
  },
  { path: '', redirectTo: 'invoice-main', pathMatch: 'full' },
];
