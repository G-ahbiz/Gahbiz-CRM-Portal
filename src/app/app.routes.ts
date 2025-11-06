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
import { Leads } from './features/crm-dashboard/sales-crm/leads/leads';
import { SalesAgents } from './features/crm-dashboard/sales-crm/sales-agents/sales-agents';
import { OrderDetails } from './features/crm-dashboard/orders-crm/order-details/order-details';
import { OrdersContent } from './features/crm-dashboard/orders-crm/orders-content/orders-content';
import { AddOrder } from './features/crm-dashboard/orders-crm/add-order/add-order';
import { AddInvoice } from './features/crm-dashboard/invoices-crm/add-invoice/add-invoice';
import { InvoiceContent } from './features/crm-dashboard/invoices-crm/invoice-content/invoice-content';
import { InvoiceDetails } from './features/crm-dashboard/invoices-crm/invoice-details/invoice-details';

export const routes: Routes = [
  {
    path: '', component: CrmLayout, children: [
      {
        path: 'main', component: CrmDashboard, children: [
          { path: 'dashboard', component: MainDashboard },
          { path: 'customers', component: CustomersCrm },
          {
            path: 'sales', component: SalesCrm, children: [
              { path: 'leads', component: Leads },
              { path: 'sales-agents', component: SalesAgents },
              { path: '', redirectTo: 'leads', pathMatch: 'full' }
            ]
          },
          {
            path: 'invoices', component: InvoicesCrm, children: [
              { path: 'invoice-main', component: InvoiceContent },
              { path: 'invoice-details', component: InvoiceDetails },
              { path: 'add-invoice', component: AddInvoice },
              { path: '', redirectTo: 'invoice-main', pathMatch: 'full' },
            ]
          },
          {
            path: 'orders', component: OrdersCrm, children: [
              { path: 'orders-main', component: OrdersContent },
              { path: 'order-details', component: OrderDetails },
              { path: 'add-order', component: AddOrder },
              { path: '', redirectTo: 'orders-main', pathMatch: 'full' },
            ]
          },
          { path: 'reports', component: ReportsCrm },
          { path: 'settings', component: SettingsCrm },
          { path: '', redirectTo: 'orders', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'main', pathMatch: 'full' }
    ]
  }
];
