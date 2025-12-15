import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-crm-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.css',
})
export class CrmLayout {
  private languageService = inject(LanguageService);

  isMobileView = signal<boolean>(false);
  showMobileBackdrop = signal<boolean>(false);
  isSidebarOpen = signal<boolean>(false);
  isSidebarCollapsed = signal<boolean>(false);

  isRTL = this.languageService.isRTL;

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth < 1024; // 1024px is our breakpoint
    this.isMobileView.set(isMobile);

    if (!isMobile) {
      // Desktop: always show sidebar, no backdrop
      this.showMobileBackdrop.set(false);
      this.isSidebarOpen.set(true);
    } else {
      // Mobile/Tablet: hide sidebar by default
      this.showMobileBackdrop.set(false);
      this.isSidebarOpen.set(false);
    }
  }

  toggleMobileSidebar() {
    if (this.isMobileView()) {
      this.isSidebarOpen.set(!this.isSidebarOpen());
      this.showMobileBackdrop.set(this.isSidebarOpen());
    }
  }

  closeMobileSidebar() {
    if (this.isMobileView()) {
      this.isSidebarOpen.set(false);
      this.showMobileBackdrop.set(false);
    }
  }

  onSidebarToggled() {
    if (this.isMobileView() && this.isSidebarOpen()) {
      this.closeMobileSidebar();
    }
  }

  toggleSidebarCollapsed() {
    // Only allow collapsing on desktop
    if (!this.isMobileView()) {
      this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
    }
  }
}
