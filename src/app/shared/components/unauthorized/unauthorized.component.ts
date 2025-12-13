import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css',
})
export class UnauthorizedComponent {
  icon!: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {
    this.icon = this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="70" height="70" viewBox="0 0 48 48" fill="none" stroke="#d32f2f" stroke-width="4">
        <circle cx="24" cy="24" r="20" />
        <path d="M16 16L32 32M32 16L16 32" />
      </svg>
    `);
  }

  title = 'Access Denied';
  message = 'You do not have permission to view this page. Please verify your credentials.';
}
