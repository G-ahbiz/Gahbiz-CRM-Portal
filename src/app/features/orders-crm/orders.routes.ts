import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: 'orders-main',
    loadComponent: () =>
      import('./components/orders-content/orders-content').then((m) => m.OrdersContent),
  },
  {
    path: 'add-order',
    loadComponent: () => import('./components/add-order/add-order').then((m) => m.AddOrder),
  },
  {
    path: 'order-details/:id',
    loadComponent: () =>
      import('./components/order-details/order-details').then((m) => m.OrderDetailsComponent),
  },
  { path: '', redirectTo: 'orders-main', pathMatch: 'full' },
];
