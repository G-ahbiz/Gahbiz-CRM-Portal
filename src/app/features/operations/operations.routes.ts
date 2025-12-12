import { Routes } from '@angular/router';

export const OPERATIONS_ROUTES: Routes = [
  {
    path: 'operations-main',
    loadComponent: () =>
      import('./pages/operations-content/operations-content').then((m) => m.OperationsContent),
  },
  {
    path: 'operation-files/:id',
    loadComponent: () =>
      import('./components/operation-files/operation-files').then((m) => m.OperationFiles),
  },
  { path: '', redirectTo: 'operations-main', pathMatch: 'full' },
];
