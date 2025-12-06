import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivityLog } from '@features/sales-crm/interfaces/activity-log';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-log-item',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './activity-log-item.component.html',
  styleUrls: ['./activity-log-item.component.css'],
})
export class ActivityLogItemComponent implements OnInit {
  @Input() log!: ActivityLog;

  private readonly translateService = inject(TranslateService);

  ngOnInit() {
    if (this.log.isCollapsed === undefined) {
      this.log.isCollapsed = true; // Start collapsed by default
    }
  }

  toggleCollapse() {
    this.log.isCollapsed = !this.log.isCollapsed;
  }

  getActivityIcon(): string {
    switch (this.log.type) {
      case 'PhoneCall':
        return 'pi pi-phone';
      case 'OnlineChat':
        return 'pi pi-comments';
      case 'Email':
        return 'pi pi-envelope';
      case 'Other':
        return 'pi pi-question-circle';
      default:
        return 'pi pi-calendar';
    }
  }

  getDisplayType(): string {
    switch (this.log.type) {
      case 'PhoneCall':
        return this.translateService.instant('LEADS.ACTIVITY_TYPES.PHONE_CALL');
      case 'OnlineChat':
        return this.translateService.instant('LEADS.ACTIVITY_TYPES.ONLINE_CHAT');
      case 'Email':
        return this.translateService.instant('LEADS.ACTIVITY_TYPES.EMAIL');
      case 'Other':
        return this.translateService.instant('LEADS.ACTIVITY_TYPES.OTHER');
      default:
        return this.log.type;
    }
  }

  getDisplayDate(): string {
    try {
      return new Date(this.log.date).toLocaleDateString(this.translateService.currentLang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return this.translateService.instant('COMMON.INVALID_DATE');
    }
  }

  getDisplayTime(): string {
    try {
      return new Date(this.log.date).toLocaleTimeString(this.translateService.currentLang, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return this.translateService.instant('COMMON.INVALID_TIME');
    }
  }

  getDisplayFollowUpDate(): string {
    if (!this.log.followUpDate) return '-';
    try {
      return new Date(this.log.followUpDate).toLocaleDateString(this.translateService.currentLang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return this.translateService.instant('COMMON.INVALID_DATE');
    }
  }

  getTruncatedDetails(maxLength: number = 60): string {
    if (!this.log.details) return this.translateService.instant('COMMON.NOT_AVAILABLE');
    if (this.log.details.length <= maxLength) return this.log.details;
    return this.log.details.substring(0, maxLength) + '...';
  }

  getStatusBadgeClass(): string {
    switch (this.log.status) {
      case 'Positive':
        return 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25';
      case 'Negative':
        return 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
      case 'WrongData':
        return 'badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
      default:
        return 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
    }
  }

  getCallStatusBadgeClass(): string {
    switch (this.log.callStatus) {
      case 'Response':
        return 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25';
      case 'NoResponse':
        return 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
      default:
        return 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
    }
  }

  getTrafficBadgeClass(): string {
    switch (this.log.traffic) {
      case 'Incoming':
        return 'badge bg-info bg-opacity-10 text-info border border-info border-opacity-25';
      case 'Outgoing':
        return 'badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
      default:
        return 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
    }
  }

  getSourceBadgeClass(): string {
    if (!this.log.source || this.log.source === 'None') return 'badge bg-light text-dark border';
    return 'badge bg-purple bg-opacity-10 text-purple border border-purple border-opacity-25';
  }

  getOpportunityClass(): string {
    if (!this.log.opportunityPercentage) return 'text-muted';
    if (this.log.opportunityPercentage >= 80) return 'text-success fw-bold';
    if (this.log.opportunityPercentage >= 50) return 'text-warning';
    return 'text-danger';
  }

  hasDetails(): boolean {
    return !!this.log.details && this.log.details.trim().length > 0;
  }

  hasNeed(): boolean {
    return !!this.log.need && this.log.need.trim().length > 0;
  }

  hasSource(): boolean {
    return !!this.log.source && this.log.source !== 'None';
  }

  hasFollowUp(): boolean {
    return !!this.log.followUpDate;
  }

  hasOpportunity(): boolean {
    return this.log.opportunityPercentage !== null && this.log.opportunityPercentage !== undefined;
  }
}
