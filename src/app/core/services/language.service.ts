import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly activeLang = signal<string>('en');

  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setFallbackLang('en');

    const saved = localStorage.getItem('lang');
    const browser = this.translate.getBrowserLang();
    const lang = saved ?? (browser && ['en', 'ar'].includes(browser) ? browser : 'en');

    this.use(lang);
  }

  use(lang: string) {
    this.activeLang.set(lang);
    this.translate.use(lang);
    // localStorage.setItem('lang', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr'; //lang === 'ar' ? 'rtl' : 'ltr';
  }

  get currentLang() {
    return this.activeLang.asReadonly();
  }
}
