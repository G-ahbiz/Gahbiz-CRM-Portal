import { Routes } from '@angular/router';
import { CrmLayout } from './shared/pages/crm-layout/crm-layout';
import { noAuthGuard } from '@core/guards/no-auth.guard';
import { authGuard } from '@core/guards/auth.guard';
import { ALLOWED_ROLES } from '@core/constants/auth.constants';
import { roleGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivateChild: [noAuthGuard],
    loadChildren: () => import('./features/auth/auth.routing').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'main',
    component: CrmLayout,
    canActivate: [authGuard, roleGuard],
    canActivateChild: [authGuard, roleGuard],
    data: { roles: [...ALLOWED_ROLES] },
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
        path: 'operations',
        loadChildren: () =>
          import('./features/operations/operations.routes').then((m) => m.OPERATIONS_ROUTES),
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
        loadChildren: () =>
          import('./features/reports-crm/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings-crm/settings-crm').then((m) => m.SettingsCrm),
      },
    ],
  },
  { path: '', redirectTo: 'main/dashboard', pathMatch: 'full' },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('@shared/components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
];
