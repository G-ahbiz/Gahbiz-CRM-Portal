import { Routes } from '@angular/router';
import { CrmLayout } from './features/crm-layout/crm-layout';


export const routes: Routes = [
  {
    path: '', component: CrmLayout, children: [
      {
        path: 'main', loadComponent: () => import('./features/crm-dashboard/crm-dashboard').then(m => m.CrmDashboard), children: [
          { path: 'dashboard', loadComponent: () => import('./features/crm-dashboard/main-dashboard/main-dashboard').then(m => m.MainDashboard) },
          { path: 'customers', loadChildren: () => import('./features/crm-dashboard/customers-crm/customers.routes').then(m => m.customersRoutes) },
          { path: 'sales', loadChildren: () => import('./features/crm-dashboard/sales-crm/sales.routes').then(m => m.salesRoutes) },
          { path: 'invoices', loadChildren: () => import('./features/crm-dashboard/invoices-crm/invoice.routes').then(m => m.invoiceRoutes) },
          { path: 'orders', loadChildren: () => import('./features/crm-dashboard/orders-crm/orders.routes').then(m => m.ordersRoutes) },
          { path: 'reports', loadComponent: () => import('./features/crm-dashboard/reports-crm/reports-crm').then(m => m.ReportsCrm) },
          { path: 'settings', loadComponent: () => import('./features/crm-dashboard/settings-crm/settings-crm').then(m => m.SettingsCrm) },
          { path: '', redirectTo: 'orders', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'main', pathMatch: 'full' }
    ]
  }
];
