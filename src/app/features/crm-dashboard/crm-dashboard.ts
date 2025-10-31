import { Component } from '@angular/core';
import { MainDashboard } from "./main-dashboard/main-dashboard";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-crm-dashboard',
  imports: [MainDashboard, RouterOutlet],
  templateUrl: './crm-dashboard.html',
  styleUrl: './crm-dashboard.css',
})
export class CrmDashboard {

}
