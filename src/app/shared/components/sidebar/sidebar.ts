import { Component, OnInit, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ROUTES } from '@shared/config/constants';

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

  isArabic = signal<boolean>(false);
  isEnglish = signal<boolean>(false);
  isSpain = signal<boolean>(false);

  isSalesActive = signal<boolean>(false);
  isLeadsActive = signal<boolean>(false);
  isSalesAgentsActive = signal<boolean>(false);

  Routes = ROUTES;

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    this.initializeTranslation();
    this.checkSalesActive();
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    } else {
      // Emit event to parent to toggle collapsed state
      this.sidebarCollapsedToggled.emit();
    }
  }

  handleNavigationClick() {
    this.checkSalesActive();
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  onLinkClick() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  private initializeTranslation() {
    if (!localStorage.getItem('ServabestCRM-language')) {
      localStorage.setItem('ServabestCRM-language', 'en');
    }

    const savedLang = localStorage.getItem('ServabestCRM-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);

    this.isArabic.set(savedLang === 'ar');
    this.isEnglish.set(savedLang === 'en');
    this.isSpain.set(savedLang === 'es');

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.isArabic.set(event.lang === 'ar');
      this.isEnglish.set(event.lang === 'en');
      this.isSpain.set(savedLang === 'es');
    });
  }

  toggleSalesActive() {
    this.isSalesActive.set(!this.isSalesActive());
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
