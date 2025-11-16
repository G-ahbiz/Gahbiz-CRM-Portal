import { Routes } from '@angular/router';
import { CrmLayout } from './shared/pages/crm-layout/crm-layout';

export const routes: Routes = [
  {
    path: 'main',
    component: CrmLayout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/main-dashboard/main-dashboard').then((m) => m.MainDashboard),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers-crm/customers.routes').then((m) => m.customersRoutes),
      },
      {
        path: 'sales',
        loadChildren: () => import('./features/sales-crm/sales.routes').then((m) => m.salesRoutes),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./features/invoices-crm/invoice.routes').then((m) => m.invoiceRoutes),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders-crm/orders.routes').then((m) => m.ordersRoutes),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports-crm/reports-crm').then((m) => m.ReportsCrm),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings-crm/settings-crm').then((m) => m.SettingsCrm),
      },
      { path: '', redirectTo: 'main', pathMatch: 'full' },
    ],
  },
];
