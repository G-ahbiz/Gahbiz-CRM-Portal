import { Routes } from '@angular/router';

export const salesRoutes: Routes = [
  {
    path: 'leads', loadComponent: () => import('./leads/leads').then(m => m.Leads), children: [
      { path: 'leads-main', loadComponent: () => import('./leads/leads-content/leads-content').then(m => m.LeadsContent) },
      { path: 'leads-details', loadComponent: () => import('./leads/leads-details/leads-details').then(m => m.LeadsDetails) },
      { path: 'add-lead', loadComponent: () => import('./leads/leads-add/leads-add').then(m => m.LeadsAdd) },
      { path: '', redirectTo: 'leads-main', pathMatch: 'full' }
    ]
  },
  {
    path: 'sales-agents', loadComponent: () => import('./sales-agents/sales-agents').then(m => m.SalesAgents), children: [
      { path: 'sales-agent-main', loadComponent: () => import('./sales-agents/sales-agent-content/sales-agent-content').then(m => m.SalesAgentContent) },
      { path: 'sales-agent-details', loadComponent: () => import('./sales-agents/sales-agents-details/sales-agents-details').then(m => m.SalesAgentsDetails) },
      { path: 'add-sales-agent', loadComponent: () => import('./sales-agents/sales-agents-add/sales-agents-add').then(m => m.SalesAgentsAdd) },
      { path: '', redirectTo: 'sales-agent-main', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'leads', pathMatch: 'full' }
]
