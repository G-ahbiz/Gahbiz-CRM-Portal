import { Routes } from '@angular/router';

export const salesRoutes: Routes = [
  {
    path: 'leads',
    loadComponent: () => import('./pages/leads/leads').then((m) => m.Leads),
    children: [
      {
        path: 'leads-main',
        loadComponent: () =>
          import('./components/leads/leads-content/leads-content').then((m) => m.LeadsContent),
      },
      {
        path: 'add-lead',
        loadComponent: () =>
          import('./components/leads/leads-add/leads-add').then((m) => m.LeadsAdd),
      },
      { path: '', redirectTo: 'leads-main', pathMatch: 'full' },
    ],
  },
  {
    path: 'sales-agents',
    loadComponent: () => import('./pages/sales-agents/sales-agents').then((m) => m.SalesAgents),
    children: [
      {
        path: 'sales-agent-main',
        loadComponent: () =>
          import('./components/sales-agent/sales-agent-content/sales-agent-content').then(
            (m) => m.SalesAgentContent
          ),
      },
      {
        path: 'sales-agent-details',
        loadComponent: () =>
          import('./components/sales-agent/sales-agents-details/sales-agents-details').then(
            (m) => m.SalesAgentsDetails
          ),
      },
      {
        path: 'add-sales-agent',
        loadComponent: () =>
          import('./components/sales-agent/sales-agents-add/sales-agents-add').then(
            (m) => m.SalesAgentsAdd
          ),
      },
      { path: '', redirectTo: 'sales-agent-main', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'leads', pathMatch: 'full' },
];
