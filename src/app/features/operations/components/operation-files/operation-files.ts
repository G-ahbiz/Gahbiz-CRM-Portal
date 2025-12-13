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
import { ROUTES } from '@shared/config/constants';
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

  readonly parsedUserInfo = computed<Record<string, unknown>>(() => {
    const detailsData = this.details();
    const raw = detailsData?.jsonData;
    if (!raw?.trim()) {
      return {};
    }

    try {
      let cleanedRaw = raw.trim();

      // Check if the raw value includes the property name (e.g., "jsonData_PlainText": "{...}")
      // If so, extract just the value part
      if (cleanedRaw.includes('"jsonData_PlainText":') || cleanedRaw.includes('"jsonData":')) {
        // Parse the entire string as JSON to get the object
        const tempObj = JSON.parse(`{${cleanedRaw}}`);
        cleanedRaw = tempObj.jsonData_PlainText || tempObj.jsonData || '';
      }

      // Now extract just the JSON object part
      const firstBrace = cleanedRaw.indexOf('{');
      const lastBrace = cleanedRaw.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedRaw = cleanedRaw.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanedRaw);

      // Handle double-encoded JSON strings
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

    // Check if already added
    if (this.hasAddedRequest(serviceFileId)) {
      return;
    }

    // Add to pending requests
    this.pendingRequests.update((prev) => [...prev, { serviceFileId, comment }]);

    // Close the edit form
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
