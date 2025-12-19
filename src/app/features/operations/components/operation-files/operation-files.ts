import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { OperationsFacadeService } from '../../services/operations.facade.service';
import { GetSubmissionDetails } from '../../interfaces/get-submission-details';
import { ServiceFileGroup } from '../../interfaces/service-file';
import { ToastService } from '@core/services/toast.service';
import { ClientServiceStatus, ROUTES } from '@shared/config/constants';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-operation-files',
  imports: [CommonModule, TranslateModule],
  templateUrl: './operation-files.html',
  styleUrl: './operation-files.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationFiles {
  // Services
  private readonly route = inject(ActivatedRoute);
  private readonly operationsFacadeService = inject(OperationsFacadeService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  // Signals
  private readonly paramMapSignal = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly queryParamMapSignal = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly submissionId = computed(() => this.paramMapSignal()?.get('id') ?? '');
  readonly isUnderReview = computed(() => this.details()?.status === 'UnderReview');

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly details = signal<GetSubmissionDetails | null>(null);

  readonly serviceFiles = computed<ServiceFileGroup[]>(() => this.details()?.serviceFiles ?? []);

  // Status update related signals
  readonly showStatusUpdateForm = signal(false);
  readonly updatingStatus = signal(false);
  readonly selectedStatus = signal<ClientServiceStatus | null>(null);
  readonly statusNote = signal('');

  // Available statuses for dropdown
  readonly availableStatuses = [
    ClientServiceStatus.Created,
    ClientServiceStatus.Submitted,
    ClientServiceStatus.UnderReview,
    ClientServiceStatus.PendingClientAction,
    ClientServiceStatus.InProgress,
    ClientServiceStatus.AwaitingExternalResponse,
    ClientServiceStatus.Verified,
    ClientServiceStatus.Completed,
    ClientServiceStatus.Cancelled,
    ClientServiceStatus.Rejected,
  ];

  // Filter out current status from available options
  readonly filteredStatuses = computed(() => {
    const currentStatus = this.details()?.status;
    return this.availableStatuses.filter((status) => status !== currentStatus);
  });

  readonly parsedUserInfo = computed<Record<string, unknown>>(() => {
    const detailsData = this.details();
    const raw = detailsData?.jsonData;
    if (!raw?.trim()) {
      return {};
    }

    try {
      let cleanedRaw = raw.trim();

      if (cleanedRaw.includes('"jsonData_PlainText":') || cleanedRaw.includes('"jsonData":')) {
        const tempObj = JSON.parse(`{${cleanedRaw}}`);
        cleanedRaw = tempObj.jsonData_PlainText || tempObj.jsonData || '';
      }

      const firstBrace = cleanedRaw.indexOf('{');
      const lastBrace = cleanedRaw.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedRaw = cleanedRaw.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanedRaw);

      if (typeof parsed === 'string') {
        let innerCleaned = parsed.trim();
        const innerFirstBrace = innerCleaned.indexOf('{');
        const innerLastBrace = innerCleaned.lastIndexOf('}');

        if (innerFirstBrace !== -1 && innerLastBrace !== -1 && innerLastBrace > innerFirstBrace) {
          innerCleaned = innerCleaned.substring(innerFirstBrace, innerLastBrace + 1);
        }

        const doubleParsed = JSON.parse(innerCleaned);
        return typeof doubleParsed === 'object' && doubleParsed !== null ? doubleParsed : {};
      }

      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.error('Raw value:', raw);
      return {};
    }
  });

  readonly activeEditId = signal<string | null>(null);
  readonly commentByFile = signal<Record<string, string>>({});
  readonly pendingRequests = signal<{ serviceFileId: string; comment: string }[]>([]);
  readonly submittingBatch = signal(false);
  readonly acceptingSubmission = signal(false);
  readonly rejectingSubmission = signal(false);
  readonly showRejectForm = signal(false);
  readonly rejectComment = signal('');

  readonly pendingRequestsCount = computed(() => this.pendingRequests().length);

  constructor() {
    effect(() => {
      const id = this.submissionId();
      if (!id) {
        return;
      }
      this.fetchSubmission(id);
    });
  }

  objectKeys(value: Record<string, unknown>): string[] {
    return Object.keys(value ?? {});
  }

  commentValue(serviceFileId: string): string {
    return this.commentByFile()[serviceFileId] ?? '';
  }

  onCommentChange(serviceFileId: string, value: string): void {
    this.commentByFile.update((prev) => ({
      ...prev,
      [serviceFileId]: value,
    }));
  }

  toggleRequest(serviceFileId: string): void {
    this.activeEditId.set(this.activeEditId() === serviceFileId ? null : serviceFileId);
    if (!this.commentByFile()[serviceFileId]) {
      this.onCommentChange(serviceFileId, '');
    }
  }

  hasAddedRequest(serviceFileId: string): boolean {
    return this.pendingRequests().some((req) => req.serviceFileId === serviceFileId);
  }

  addRequest(serviceFileId: string): void {
    const comment = this.commentValue(serviceFileId).trim();
    if (!comment) {
      return;
    }

    if (this.hasAddedRequest(serviceFileId)) {
      return;
    }

    this.pendingRequests.update((prev) => [...prev, { serviceFileId, comment }]);
    this.activeEditId.set(null);
  }

  removeRequest(serviceFileId: string): void {
    this.pendingRequests.update((prev) =>
      prev.filter((req) => req.serviceFileId !== serviceFileId)
    );
  }

  submitAllRequests(): void {
    const submissionId = this.submissionId();
    const requests = this.pendingRequests();

    if (!submissionId || requests.length === 0) {
      return;
    }

    this.submittingBatch.set(true);
    this.operationsFacadeService
      .requestEdit(submissionId, { editRequests: requests })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toastService.success(response.message ?? 'Edit requests submitted successfully');
          this.submittingBatch.set(false);
          this.pendingRequests.set([]);
          this.commentByFile.set({});
          this.activeEditId.set(null);
          this.router.navigate([ROUTES.operations]);
        },
        error: (error: HttpErrorResponse) => {
          this.submittingBatch.set(false);
          this.toastService.error(error.error ?? 'Failed to submit edit requests');
        },
      });
  }

  acceptSubmission(): void {
    const submissionId = this.submissionId();

    if (!submissionId) {
      return;
    }

    this.acceptingSubmission.set(true);
    this.operationsFacadeService
      .acceptSubmission(submissionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toastService.success(response.message ?? 'Submission accepted successfully');
          this.acceptingSubmission.set(false);
          this.router.navigate([ROUTES.operations]);
        },
        error: (error: HttpErrorResponse) => {
          this.acceptingSubmission.set(false);
          this.toastService.error(error.error?.message ?? 'Failed to accept submission');
        },
      });
  }

  toggleRejectForm(): void {
    this.showRejectForm.update((current) => !current);
    if (!this.showRejectForm()) {
      this.rejectComment.set('');
    }
  }

  submitRejection(): void {
    const submissionId = this.submissionId();
    const comment = this.rejectComment().trim();

    if (!submissionId || !comment) {
      return;
    }

    this.rejectingSubmission.set(true);
    this.operationsFacadeService
      .rejectSubmission(submissionId, comment)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toastService.success(response.message ?? 'Submission rejected successfully');
          this.rejectingSubmission.set(false);
          this.showRejectForm.set(false);
          this.rejectComment.set('');
          this.router.navigate([ROUTES.operations]);
        },
        error: (error: HttpErrorResponse) => {
          this.rejectingSubmission.set(false);
          this.toastService.error(error.error?.message ?? 'Failed to reject submission');
        },
      });
  }

  // New method: Toggle status update form
  toggleStatusUpdateForm(): void {
    this.showStatusUpdateForm.update((current) => !current);
    if (!this.showStatusUpdateForm()) {
      this.selectedStatus.set(null);
      this.statusNote.set('');
    }
  }

  // New method: Update status
  updateStatus(): void {
    const submissionId = this.submissionId();
    const status = this.selectedStatus();
    const note = this.statusNote().trim();

    if (!submissionId || !status || !note) {
      this.toastService.error('Please select a status and enter a note');
      return;
    }

    this.updatingStatus.set(true);
    this.operationsFacadeService
      .updateStatus(submissionId, status, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toastService.success(response.message ?? 'Status updated successfully');
          this.updatingStatus.set(false);
          this.showStatusUpdateForm.set(false);
          this.selectedStatus.set(null);
          this.statusNote.set('');

          // Refresh the current submission details
          this.fetchSubmission(submissionId);
        },
        error: (error: HttpErrorResponse) => {
          this.updatingStatus.set(false);
          this.toastService.error(error.error?.message ?? 'Failed to update status');
        },
      });
  }

  // Helper to get status display name (optional)
  getStatusDisplay(status: string): string {
    return status.replace(/([A-Z])/g, ' $1').trim();
  }

  // Helper to get status CSS class
  getStatusClass(status: string): string {
    switch (status) {
      case ClientServiceStatus.Created:
        return 'bg-info';
      case ClientServiceStatus.Submitted:
        return 'bg-primary';
      case ClientServiceStatus.UnderReview:
        return 'bg-warning';
      case ClientServiceStatus.PendingClientAction:
        return 'bg-secondary';
      case ClientServiceStatus.InProgress:
        return 'bg-info text-dark'; // Different text color for distinction
      case ClientServiceStatus.AwaitingExternalResponse:
        return 'bg-warning text-dark'; // Different text color for distinction
      case ClientServiceStatus.Verified:
        return 'bg-success';
      case ClientServiceStatus.Completed:
        return 'bg-success text-light'; // Slight variation
      case ClientServiceStatus.Cancelled:
      case ClientServiceStatus.Rejected:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  private fetchSubmission(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.operationsFacadeService
      .getSubmissionDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.details.set(response.data ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load submission details.');
          this.loading.set(false);
        },
      });
  }
}
