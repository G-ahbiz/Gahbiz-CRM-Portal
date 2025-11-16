import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  isSidebarCollapsed = signal<boolean>(false);

  isArabic = signal<boolean>(false);
  isEnglish = signal<boolean>(false);
  isSpain = signal<boolean>(false);

  isSalesActive = signal<boolean>(false);
  isLeadsActive = signal<boolean>(false);
  isSalesAgentsActive = signal<boolean>(false);

  constructor(private translateService: TranslateService) { }

  ngOnInit() {
    this.initializeTranslation();
    this.checkSalesActive();
  }

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  private initializeTranslation() {
    // Set default language if not already set
    if (!localStorage.getItem('ServabestCRM-language')) {
      localStorage.setItem('ServabestCRM-language', 'en');
    }

    // Get saved language and set it
    const savedLang = localStorage.getItem('ServabestCRM-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);

    // Set initial language state
    this.isArabic.set(savedLang === 'ar');
    this.isEnglish.set(savedLang === 'en');
    this.isSpain.set(savedLang === 'es');

    // Subscribe to language changes
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.isArabic.set(event.lang === 'ar');
      this.isEnglish.set(event.lang === 'en');
      this.isSpain.set(event.lang === 'es');
    });
  }

  toggleSalesActive() {
    this.isSalesActive.set(!this.isSalesActive());
    this.isLeadsActive.set(!this.isLeadsActive());
    this.isSalesAgentsActive.set(!this.isSalesAgentsActive());
  }

  toggleLeadsActive() {
    this.isLeadsActive.set(true);
    this.isSalesAgentsActive.set(false);
  }

  toggleSalesAgentsActive() {
    this.isSalesAgentsActive.set(true);
    this.isLeadsActive.set(false);
  }

  checkSalesActive() {
    if (this.isLeadsActive() || this.isSalesAgentsActive()) {
      this.isSalesActive.set(false);
    } else {
      this.isSalesActive.set(true);
    }
  }
}
