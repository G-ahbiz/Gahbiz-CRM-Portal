import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  { path: 'orders-main', loadComponent: () => import('./orders-content/orders-content').then(m => m.OrdersContent) },
  { path: 'order-details', loadComponent: () => import('./order-details/order-details').then(m => m.OrderDetails) },
  { path: 'add-order', loadComponent: () => import('./add-order/add-order').then(m => m.AddOrder) },
  { path: '', redirectTo: 'orders-main', pathMatch: 'full' },
]
