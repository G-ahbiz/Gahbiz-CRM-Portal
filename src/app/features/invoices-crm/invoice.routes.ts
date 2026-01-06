import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { CRM_HIGH_LEVEL_ROLES } from '@shared/config/constants';

export const invoiceRoutes: Routes = [
  {
    path: 'invoice-main',
    loadComponent: () =>
      import('./components/invoice-content/invoice-content').then((m) => m.InvoiceContent),
  },
  {
    path: 'invoice-details/:id',
    loadComponent: () =>
      import('./components/invoice-details/invoice-details').then((m) => m.InvoiceDetails),
  },
  {
    path: 'add-invoice',
    canActivate: [roleGuard],
    data: { roles: CRM_HIGH_LEVEL_ROLES },
    loadComponent: () => import('./components/add-invoice/add-invoice').then((m) => m.AddInvoice),
  },
  {
    path: 'update-invoice/:id',
    loadComponent: () =>
      import('./components/update-invoice/update-invoice').then((m) => m.UpdateInvoice),
  },
  { path: '', redirectTo: 'invoice-main', pathMatch: 'full' },
];
