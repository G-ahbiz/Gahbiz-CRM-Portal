import { Routes } from '@angular/router';

export const OPERATIONS_ROUTES: Routes = [
  {
    path: 'operations-main',
    loadComponent: () =>
      import('./pages/operations-content/operations-content').then((m) => m.OperationsContent),
  },
  { path: '', redirectTo: 'operations-main', pathMatch: 'full' },
];
