import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/services/language.service';
import { ROUTES } from '@shared/config/constants';
import { User } from '@features/auth/interfaces/sign-in/user';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() isMobile: boolean = false;
  @Output() mobileMenuToggled = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private languageService = inject(LanguageService);

  readonly ROUTES = ROUTES;

  // Language related signals
  currentLanguage = this.languageService.currentLanguage;
  languages = this.languageService.getLanguages();

  // Computed signals for language checks
  isArabic = () => this.currentLanguage().code === 'ar';
  isEnglish = () => this.currentLanguage().code === 'en';
  isSpanish = () => this.currentLanguage().code === 'es';

  isMenuOpen = signal(false);

  isLoggedIn = toSignal(this.authService.isLoggedIn$, {
    initialValue: this.authService.isAuthenticated(),
  });

  currentUser = toSignal<User | null>(this.authService.currentUser$, {
    initialValue: null,
  });

  toggleMobileMenu() {
    if (this.isMobile) {
      this.mobileMenuToggled.emit();
    }
  }

  setLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
    this.closeMenu();
  }

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
