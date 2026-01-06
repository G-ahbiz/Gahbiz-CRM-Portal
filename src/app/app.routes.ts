import { Routes } from '@angular/router';
import { CrmLayout } from './shared/pages/crm-layout/crm-layout';
import { noAuthGuard } from '@core/guards/no-auth.guard';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { ALL_CRM_ROLES, OPERATIONS_ROLES, SALES_ROLES, USER_TYPES } from '@shared/config/constants';

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
    canActivateChild: [authGuard],
    data: { roles: ALL_CRM_ROLES },
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: [USER_TYPES.ADMIN] },
        loadComponent: () =>
          import('./features/main-dashboard/main-dashboard').then((m) => m.MainDashboard),
      },
      {
        path: 'customers',
        canActivate: [roleGuard],
        data: { roles: SALES_ROLES },
        loadChildren: () =>
          import('./features/customers-crm/customers.routes').then((m) => m.customersRoutes),
      },
      {
        path: 'sales',
        canActivate: [roleGuard],
        data: { roles: [...SALES_ROLES, USER_TYPES.SALES_AGENT_PROVIDER] },
        loadChildren: () => import('./features/sales-crm/sales.routes').then((m) => m.salesRoutes),
      },
      {
        path: 'operations',
        canActivate: [roleGuard],
        data: { roles: OPERATIONS_ROLES },
        loadChildren: () =>
          import('./features/operations/operations.routes').then((m) => m.OPERATIONS_ROUTES),
      },
      {
        path: 'invoices',
        canActivate: [roleGuard],
        data: { roles: SALES_ROLES },
        loadChildren: () =>
          import('./features/invoices-crm/invoice.routes').then((m) => m.invoiceRoutes),
      },
      {
        path: 'orders',
        canActivate: [roleGuard],
        data: { roles: [...SALES_ROLES] },
        loadChildren: () =>
          import('./features/orders-crm/orders.routes').then((m) => m.ordersRoutes),
      },
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { roles: [USER_TYPES.ADMIN] },
        loadChildren: () =>
          import('./features/reports-crm/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: ALL_CRM_ROLES },
        loadComponent: () =>
          import('./features/settings-crm/settings-crm').then((m) => m.SettingsCrm),
      },
    ],
  },
  { path: '', redirectTo: 'main/customers', pathMatch: 'full' },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('@shared/components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
];
