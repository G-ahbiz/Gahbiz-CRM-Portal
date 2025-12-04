import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';
import { ActivityLog } from '@features/sales-crm/interfaces/activity-log';
import { ActivityLogItemComponent } from '../activity-log-item/activity-log-item.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-leads-details',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ActivityLogItemComponent, TranslateModule],
  templateUrl: './leads-details.html',
  styleUrls: ['./leads-details.css'],
})
export class LeadsDetails implements OnInit {
  @Input() lead?: LeadDetails | null;
  @Input() leadId?: string;
  @Output() closed = new EventEmitter<void>();

  private readonly facade = inject(LeadsFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  // State signals
  activeTab = signal<string>('details');
  loading = signal<boolean>(false);
  loadingActivityLogs = signal<boolean>(false);
  error = signal<string>('');

  leadData = signal<LeadDetails | null>(null);
  activityLogs = signal<ActivityLog[]>([]);

  // Computed values
  fullName = computed(() => {
    const lead = this.leadData();
    const first = lead?.firstName ?? '';
    const last = lead?.lastName ?? '';
    return `${first} ${last}`.trim() || this.translateService.instant('COMMON.NOT_AVAILABLE');
  });

  assignedToName = computed(
    () =>
      this.leadData()?.assignedTo?.fullName ?? this.translateService.instant('LEADS.UNASSIGNED')
  );

  serviceNames = computed(() => {
    const services = this.leadData()?.servicesOfInterest;
    if (!services || !Array.isArray(services)) return [];
    return services.map((s) => (typeof s === 'string' ? s : s.name ?? '')).filter(Boolean);
  });

  ngOnInit() {
    if (this.lead) {
      this.leadData.set(this.lead);
    } else if (this.leadId) {
      this.loadLeadById(this.leadId);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);

    if (tab === 'activity' && this.leadData()?.id && this.activityLogs().length === 0) {
      this.loadActivityLogs(this.leadData()!.id);
    }
  }

  loadLeadById(id: string) {
    this.loading.set(true);
    this.error.set('');

    this.facade
      .getLeadById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.leadData.set(response.data ?? null);
          if (!response.data) {
            this.error.set(this.translateService.instant('LEADS.ERRORS.LEAD_NOT_FOUND'));
            this.toastService.error(this.translateService.instant('LEADS.ERRORS.LEAD_NOT_FOUND'));
          } else {
            this.toastService.success(this.translateService.instant('LEADS.SUCCESS.LOADED'));
          }
        },
        error: (error) => {
          const errorMsg = this.translateService.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEAD');
          this.error.set(errorMsg);
          this.toastService.error(errorMsg);
          console.error('Error loading lead:', error);
        },
      });
  }

  loadActivityLogs(leadId: string) {
    this.loadingActivityLogs.set(true);
    this.error.set('');

    this.facade
      .getLeadActivities(leadId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingActivityLogs.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            const transformedLogs: ActivityLog[] = response.data.map((log: any) => ({
              id: log.id,
              date: log.date,
              userName: log.userName,
              profileImageUrl: log.profileImageUrl,
              type: log.type,
              traffic: log.traffic,
              status: log.status,
              callStatus: log.callStatus,
              duration: log.duration,
              followUpDate: log.followUpDate,
              details: log.details,
              source: log.source,
              opportunityPercentage: log.opportunityPercentage,
              isCollapsed: false,
            }));
            this.activityLogs.set(transformedLogs);
          } else {
            this.error.set(this.translateService.instant('LEADS.WARNINGS.NO_ACTIVITY_LOGS'));
            this.toastService.warning(
              this.translateService.instant('LEADS.WARNINGS.NO_ACTIVITY_LOGS')
            );
          }
        },
        error: (error) => {
          const errorMsg = this.translateService.instant('LEADS.ERRORS.FAILED_TO_LOAD_ACTIVITY_LOGS');
          this.error.set(errorMsg);
          this.toastService.error(errorMsg);
          console.error('Error loading activity logs:', error);
        },
      });
  }

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

  onClose() {
    this.closed.emit();
  }
}
