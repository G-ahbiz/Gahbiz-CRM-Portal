import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  isoCode: string;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'ServabestCRM-language';
  private readonly DEFAULT_LANG = 'en';
  private readonly document = inject(DOCUMENT);
  private translate = inject(TranslateService);

  // Enhanced language configurations
  readonly languages: LanguageConfig[] = [
    {
      code: 'en',
      name: 'English',
      flag: 'assets/images/header/language-icons/america.svg',
      direction: 'ltr',
      isoCode: 'en-US',
    },
    {
      code: 'ar',
      name: 'العربية',
      flag: 'assets/images/header/language-icons/egypt.svg',
      direction: 'rtl',
      isoCode: 'ar-SA',
    },
    {
      code: 'sp',
      name: 'Español',
      flag: 'assets/images/header/language-icons/spain.svg',
      direction: 'ltr',
      isoCode: 'sp-SP',
    },
  ];

  private currentLanguageSignal = signal<LanguageConfig>(this.languages[0]);

  readonly currentLanguage = this.currentLanguageSignal.asReadonly();
  direction = computed(() => this.currentLanguageSignal().direction);
  isRTL = computed(() => this.direction() === 'rtl');

  private languageChangeSubject = new BehaviorSubject<LanguageConfig>(this.currentLanguageSignal());
  readonly onLanguageChange = this.languageChangeSubject.asObservable();

  constructor() {
    this.initialize();

    effect(() => {
      const lang = this.currentLanguageSignal();

      // Update HTML attributes
      this.document.documentElement.dir = lang.direction;
      this.document.documentElement.lang = lang.isoCode || lang.code;
      this.document.documentElement.setAttribute('data-direction', lang.direction);

      // Add/remove RTL class to body
      if (lang.direction === 'rtl') {
        this.document.body.classList.add('rtl');
        this.document.body.classList.remove('ltr');
      } else {
        this.document.body.classList.add('ltr');
        this.document.body.classList.remove('rtl');
      }

      // Notify subscribers
      this.languageChangeSubject.next(lang);
    });
  }

  private initialize(): void {
    // Initialize translate service
    this.translate.addLangs(this.languages.map((lang) => lang.code));
    this.translate.setDefaultLang(this.DEFAULT_LANG);

    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    const browserLang = this.translate.getBrowserLang();
    const langToUse = this.getValidLanguage(savedLang || browserLang || this.DEFAULT_LANG);

    const initialLang = this.languages.find((lang) => lang.code === langToUse) || this.languages[0];

    // Set initial language synchronously
    this.currentLanguageSignal.set(initialLang);

    // Load translations
    this.translate.use(langToUse).subscribe({
      next: () => {
        localStorage.setItem(this.STORAGE_KEY, langToUse);
      },
      error: (err) => {
        console.error('Failed to load initial language:', err);
      },
    });
  }

  setLanguage(langCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const language = this.languages.find((lang) => lang.code === langCode);

      if (!language) {
        console.warn(`Language ${langCode} not found, using default`);
        reject(new Error(`Language ${langCode} not found`));
        return;
      }

      this.translate.use(language.code).subscribe({
        next: () => {
          this.currentLanguageSignal.set(language);
          localStorage.setItem(this.STORAGE_KEY, language.code);
          resolve();
        },
        error: (err) => {
          console.error('Failed to load language:', err);
          reject(err);
        },
      });
    });
  }

  getCurrentLanguage(): LanguageConfig {
    return this.currentLanguageSignal();
  }

  getLanguages(): LanguageConfig[] {
    return [...this.languages];
  }

  private getValidLanguage(langCode: string): string {
    // Map browser language codes to supported codes
    const languageMap: { [key: string]: string } = {
      ar: 'ar',
      en: 'en',
      sp: 'sp',
    };

    const mappedCode = languageMap[langCode] || langCode;
    const validLang = this.languages.find((lang) => lang.code === mappedCode);
    return validLang ? validLang.code : this.DEFAULT_LANG;
  }

  // CSS Utility methods
  getTextAlignmentClass(override?: 'left' | 'center' | 'right'): string {
    if (override) {
      return override === 'left' ? 'text-start' : override === 'right' ? 'text-end' : 'text-center';
    }
    return this.isRTL() ? 'text-end' : 'text-start';
  }

  getFlexDirectionClass(reverse: boolean = false): string {
    if (reverse) {
      return this.isRTL() ? 'flex-row' : 'flex-row-reverse';
    }
    return this.isRTL() ? 'flex-row-reverse' : 'flex-row';
  }

  getJustifyContentClass(alignment: 'start' | 'end' | 'center' | 'between' | 'around'): string {
    const direction = this.isRTL() ? 'reverse-' : '';

    switch (alignment) {
      case 'start':
        return `justify-content-${direction}start`;
      case 'end':
        return `justify-content-${direction}end`;
      case 'center':
        return 'justify-content-center';
      case 'between':
        return 'justify-content-between';
      case 'around':
        return 'justify-content-around';
      default:
        return '';
    }
  }

  getMarginClass(side: 'start' | 'end' | 'top' | 'bottom', size: string = ''): string {
    if (side === 'start' || side === 'end') {
      return this.isRTL()
        ? side === 'start'
          ? `ms-${size}`
          : `me-${size}`
        : side === 'start'
        ? `me-${size}`
        : `ms-${size}`;
    }
    return `${side[0]}${side === 'top' || side === 'bottom' ? 't' : 'b'}-${size}`;
  }

  getPaddingClass(side: 'start' | 'end' | 'top' | 'bottom', size: string = ''): string {
    if (side === 'start' || side === 'end') {
      return this.isRTL()
        ? side === 'start'
          ? `ps-${size}`
          : `pe-${size}`
        : side === 'start'
        ? `pe-${size}`
        : `ps-${size}`;
    }
    return `${side[0]}${side === 'top' || side === 'bottom' ? 't' : 'b'}-${size}`;
  }

  getFloatClass(side: 'start' | 'end'): string {
    return this.isRTL()
      ? side === 'start'
        ? 'float-end'
        : 'float-start'
      : side === 'start'
      ? 'float-start'
      : 'float-end';
  }
}
