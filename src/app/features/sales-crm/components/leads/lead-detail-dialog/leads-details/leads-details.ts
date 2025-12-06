import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  signal,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { Router } from '@angular/router';
import { ActivityCreateComponent } from '../activity-create/activity-create.component';
import { ActivityLogComponent } from '../activity-log/activity-log.component';
import { LeadInfoComponent } from '../lead-info/lead-info.component';

@Component({
  selector: 'app-leads-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LeadInfoComponent,
    ActivityLogComponent,
    ActivityCreateComponent,
  ],
  templateUrl: './leads-details.html',
  styleUrls: ['./leads-details.css'],
})
export class LeadsDetails implements OnInit {
  @Input() lead?: LeadDetails | null;
  @Input() leadId?: string;
  @Output() closed = new EventEmitter<void>();

  @ViewChild(ActivityLogComponent) activityLogComponent!: ActivityLogComponent;

  private readonly facade = inject(LeadsFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  // State signals
  activeTab = signal<string>('details');
  loading = signal<boolean>(false);
  error = signal<string>('');
  activityTabMode = signal<'view' | 'add'>('view');

  leadData = signal<LeadDetails | null>(null);

  // Computed values
  fullName = computed(() => {
    const lead = this.leadData();
    const first = lead?.firstName ?? '';
    const last = lead?.lastName ?? '';
    return `${first} ${last}`.trim() || this.translateService.instant('COMMON.NOT_AVAILABLE');
  });

  assignedToName = computed(
    () => this.leadData()?.assignedTo?.fullName ?? this.translateService.instant('LEADS.UNASSIGNED')
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
    this.activityTabMode.set('view');

    // If switching to activity tab and it's in view mode, trigger reload
    if (tab === 'activity' && this.activityTabMode() === 'view' && this.activityLogComponent) {
      setTimeout(() => {
        this.activityLogComponent.refreshLogs();
      });
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

  addNewActivity() {
    this.setActiveTab('activity');
    this.activityTabMode.set('add');
  }

  onActivityCreated() {
    this.activityTabMode.set('view');
    // Refresh activity logs after creating a new one
    setTimeout(() => {
      if (this.activityLogComponent) {
        this.activityLogComponent.refreshLogs();
      }
    });
  }

  onRefreshActivityLogs() {
    if (this.activityLogComponent) {
      this.activityLogComponent.refreshLogs();
    }
  }

  onActivityCancelled() {
    this.activityTabMode.set('view');
  }

  editLead(id: string | undefined) {
    if (!id) return;
    this.router.navigate(['/main/sales/leads/edit-lead', id]);
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
