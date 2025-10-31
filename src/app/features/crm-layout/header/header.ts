import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {

  isArabic = signal<boolean>(false);
  isEnglish = signal<boolean>(false);
  isSpain = signal<boolean>(false);

  constructor(private translateService: TranslateService) { }

  ngOnInit() {
    this.initializeTranslation();
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

  setLanguage(lang: string) { }
}
