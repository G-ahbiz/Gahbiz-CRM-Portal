import { Component, OnInit, signal, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES } from '@shared/config/constants';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  @Input() isMobile: boolean = false;
  @Input() isSidebarCollapsed: boolean = false;
  @Output() sidebarToggled = new EventEmitter<void>();
  @Output() sidebarCollapsedToggled = new EventEmitter<void>();

  private languageService = inject(LanguageService);

  isSalesActive = signal<boolean>(false);
  isLeadsActive = signal<boolean>(false);
  isSalesAgentsActive = signal<boolean>(false);

  Routes = ROUTES;
  isRTL = this.languageService.isRTL;

  ngOnInit() {
    // Initialize based on current route
    this.checkActiveRoutes();
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    } else {
      this.sidebarCollapsedToggled.emit();
    }
  }

  handleNavigationClick() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  onLinkClick() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  toggleSalesActive() {
    this.isSalesActive.set(!this.isSalesActive());
  }

  toggleLeadsActive() {
    this.isLeadsActive.set(true);
    this.isSalesAgentsActive.set(false);
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  toggleSalesAgentsActive() {
    this.isSalesAgentsActive.set(true);
    this.isLeadsActive.set(false);
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  private checkActiveRoutes() {
    // You can implement logic here to check current route
    // and set active states accordingly
  }
}
