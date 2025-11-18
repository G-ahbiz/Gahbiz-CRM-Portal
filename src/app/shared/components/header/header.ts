import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { ROUTES } from '@shared/config/constants';
import { User } from '@features/auth/interfaces/sign-in/user';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly ROUTES = ROUTES;

  isArabic = signal<boolean>(false);
  isEnglish = signal<boolean>(false);
  isSpain = signal<boolean>(false);
  isMenuOpen = signal(false);

  isLoggedIn = toSignal(this.authService.isLoggedIn$, {
    initialValue: this.authService.isAuthenticated(),
  });

  currentUser = toSignal<User | null>(this.authService.currentUser$, {
    initialValue: null,
  });

  constructor(private translateService: TranslateService) {}

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

  setLanguage(lang: string) {}

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeMenu();
  }

  logout() {
    this.authService.logout();
    this.navigateTo(ROUTES.signIn);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
