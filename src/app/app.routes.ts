import { Routes } from '@angular/router';
import { CrmLayout } from './features/crm-layout/crm-layout';
import { CrmDashboard } from './features/crm-dashboard/crm-dashboard';
import { MainDashboard } from './features/crm-dashboard/main-dashboard/main-dashboard';
import { CustomersCrm } from './features/crm-dashboard/customers-crm/customers-crm';
import { SalesCrm } from './features/crm-dashboard/sales-crm/sales-crm';
import { InvoicesCrm } from './features/crm-dashboard/invoices-crm/invoices-crm';
import { OrdersCrm } from './features/crm-dashboard/orders-crm/orders-crm';
import { ReportsCrm } from './features/crm-dashboard/reports-crm/reports-crm';
import { SettingsCrm } from './features/crm-dashboard/settings-crm/settings-crm';

export const routes: Routes = [
  {
    path: '', component: CrmLayout, children: [
      {
        path: 'main', component: CrmDashboard, children: [
          { path: 'dashboard', component: MainDashboard },
          { path: 'customers', component: CustomersCrm },
          { path: 'sales', component: SalesCrm },
          { path: 'invoices', component: InvoicesCrm },
          { path: 'orders', component: OrdersCrm },
          { path: 'reports', component: ReportsCrm },
          { path: 'settings', component: SettingsCrm },
          { path: '', redirectTo: 'main', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'crm-dashboard', pathMatch: 'full' }
    ]
  }
];
