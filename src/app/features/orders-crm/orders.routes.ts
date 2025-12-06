import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: 'orders-main',
    loadComponent: () =>
      import('./components/orders-content/orders-content').then((m) => m.OrdersContent),
  },
  {
    path: 'order-details',
    loadComponent: () =>
      import('./components/order-details/order-details').then((m) => m.OrderDetails),
  },
  {
    path: 'add-order',
    loadComponent: () => import('./components/add-order/add-order').then((m) => m.AddOrder),
  },
  { path: '', redirectTo: 'orders-main', pathMatch: 'full' },
];
