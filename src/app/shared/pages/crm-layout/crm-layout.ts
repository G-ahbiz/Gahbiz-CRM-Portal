import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-crm-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.css',
})
export class CrmLayout {
  isMobileScreen = signal<boolean>(false);
  showMobileBackdrop = signal<boolean>(false);
  isMobileSidebarOpen = signal<boolean>(false);
  isSidebarCollapsed = signal<boolean>(false);

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth <= 1024;
    this.isMobileScreen.set(isMobile);

    if (!isMobile) {
      this.showMobileBackdrop.set(false);
      this.isMobileSidebarOpen.set(false);
    } else {
      this.showMobileBackdrop.set(false);
      this.isMobileSidebarOpen.set(false);
    }
  }

  isMobile(): boolean {
    return this.isMobileScreen();
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen.set(!this.isMobileSidebarOpen());
    this.showMobileBackdrop.set(this.isMobileSidebarOpen());
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen.set(false);
    this.showMobileBackdrop.set(false);
  }

  onSidebarToggled() {
    if (this.isMobileScreen() && this.isMobileSidebarOpen()) {
      this.closeMobileSidebar();
    }
  }

  toggleSidebarCollapsed() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }
}
