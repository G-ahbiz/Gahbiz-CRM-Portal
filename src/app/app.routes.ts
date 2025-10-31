import { Routes } from '@angular/router';
import { CrmLayout } from './features/crm-layout/crm-layout';
import { CrmDashboard } from './features/crm-dashboard/crm-dashboard';
import { MainDashboard } from './features/crm-dashboard/main-dashboard/main-dashboard';

export const routes: Routes = [
  {
    path: '', component: CrmLayout, children: [
      {
        path: 'crm-dashboard', component: CrmDashboard, children: [
          { path: 'main-dashboard', component: MainDashboard },
          { path: '', redirectTo: 'main-dashboard', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'crm-dashboard', pathMatch: 'full' }
    ]
  }
];
