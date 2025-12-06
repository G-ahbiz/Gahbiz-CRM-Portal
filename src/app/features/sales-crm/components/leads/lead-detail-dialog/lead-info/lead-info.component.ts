import { Component, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';

@Component({
  selector: 'app-lead-info',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TranslateModule],
  templateUrl: './lead-info.component.html',
})
export class LeadInfoComponent {
  @Input() lead: LeadDetails | null = null;
  @Input() fullName = '';
  @Input() assignedToName = '';
  @Input() serviceNames: string[] = [];

  private readonly translateService = inject(TranslateService);

  formatDate(date?: string | null): string {
    if (!date) return this.translateService.instant('COMMON.NOT_AVAILABLE');
    try {
      return new Date(date).toLocaleDateString(this.translateService.currentLang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return this.translateService.instant('COMMON.NOT_AVAILABLE');
    }
  }

  getStatusBadgeClass(status?: string | null): string {
    if (!status) return 'bg-secondary bg-opacity-10 text-secondary';
    switch (status.toLowerCase()) {
      case 'in-progress':
      case 'inprogress':
        return 'bg-warning bg-opacity-10 text-warning text-darken';
      case 'new':
        return 'bg-primary bg-opacity-10 text-primary';
      case 'qualified':
        return 'bg-success bg-opacity-10 text-success';
      case 'lost':
        return 'bg-danger bg-opacity-10 text-danger';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  }
}
