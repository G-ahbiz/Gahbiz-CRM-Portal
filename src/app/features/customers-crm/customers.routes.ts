import { Routes } from '@angular/router';
import { CountriesResolver } from '@core/resolver/countries-resolver';

export const customersRoutes: Routes = [
  {
    path: 'customers-main',
    loadComponent: () =>
      import('./components/customers-content/customers-content').then((m) => m.CustomerContent),
  },
  {
    path: 'add-customer',
    loadComponent: () =>
      import('./components/add-customers/add-customers').then((m) => m.AddCustomers),
    resolve: { countries: CountriesResolver },
  },
  {
    path: 'edit-customer/:id',
    loadComponent: () =>
      import('./components/add-customers/add-customers').then((m) => m.AddCustomers),
  },
  { path: '', redirectTo: 'customers-main', pathMatch: 'full' },
];
