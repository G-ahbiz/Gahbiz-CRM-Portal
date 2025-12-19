import { Component } from '@angular/core';
import { ROUTES } from '@shared/config/constants';

@Component({
  selector: 'app-main-dashboard',
  imports: [],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.css',
})
export class MainDashboard {
  handelDashboardClick() {
    window.location.href = ROUTES.dashboard;
  }
}
