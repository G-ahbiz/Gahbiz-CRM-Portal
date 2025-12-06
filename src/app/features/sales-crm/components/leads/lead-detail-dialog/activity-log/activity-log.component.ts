import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  signal,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivityLog } from '@features/sales-crm/interfaces/activity-log';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { ActivityLogItemComponent } from '../activity-log-item/activity-log-item.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, TranslateModule, ActivityLogItemComponent],
  templateUrl: './activity-log.component.html',
})
export class ActivityLogComponent implements OnInit, OnChanges {
  @Input() leadId?: string;
  @Output() addActivityClick = new EventEmitter<void>();
  @Output() logsLoaded = new EventEmitter<ActivityLog[]>();

  private readonly facade = inject(LeadsFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  activityLogs = signal<ActivityLog[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');

  ngOnInit(): void {
    this.loadActivityLogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload logs if leadId changes
    if (changes['leadId'] && !changes['leadId'].firstChange) {
      this.loadActivityLogs();
    }
  }

  loadActivityLogs(): void {
    // Only load if we have a leadId
    if (!this.leadId) {
      this.activityLogs.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.facade
      .getLeadActivities(this.leadId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
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
            this.logsLoaded.emit(transformedLogs); // Emit to parent if needed
          } else {
            const warningMsg = this.translateService.instant('LEADS.WARNINGS.NO_ACTIVITY_LOGS');
            this.error.set(warningMsg);
            this.activityLogs.set([]);
          }
        },
        error: (error) => {
          const errorMsg = this.translateService.instant(
            'LEADS.ERRORS.FAILED_TO_LOAD_ACTIVITY_LOGS'
          );
          this.error.set(errorMsg);
          this.toastService.error(errorMsg);
          this.activityLogs.set([]);
          console.error('Error loading activity logs:', error);
        },
      });
  }

  refreshLogs(): void {
    this.loadActivityLogs();
  }

  onAddActivity(): void {
    this.addActivityClick.emit();
  }
}
