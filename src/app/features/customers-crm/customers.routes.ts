import { Routes } from '@angular/router';

export const customersRoutes: Routes = [
  {
    path: 'customers-main',
    loadComponent: () =>
      import('./components/customers-content/customers-content').then((m) => m.CustomersContent),
  },
  {
    path: 'add-customer',
    loadComponent: () =>
      import('./components/add-customers/add-customers').then((m) => m.AddCustomers),
  },
  { path: '', redirectTo: 'customers-main', pathMatch: 'full' },
];
