import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { OperationsFacadeService } from '../../services/operations.facade.service';
import { ServiceSubmission, SubmissionStatus } from '../../interfaces/get-all-submissions-response';

type SubmissionViewModel = ServiceSubmission & { selected: boolean };

const SORTABLE_COLUMNS = ['status'] as const;

@Component({
  selector: 'app-operations-table',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
  ],
  templateUrl: './operations-table.html',
  styleUrl: './operations-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsTable implements OnInit {
  // Pagination state
  pageNumber = 1;
  pageSize = 10;

  // Sorting state
  sortColumn = signal<string>('');
  sortDirection = signal<'ASC' | 'DESC'>('ASC');

  // Filter state
  search = '';
  createdDateFrom = '';
  createdDateTo = '';
  selectedStatus: SubmissionStatus | null = null;

  // Date validation - max date is today
  todayDate = new Date().toISOString().split('T')[0];

  /**
   * Get max date for "from" input (minimum of todayDate and createdDateTo)
   */
  get maxDateFrom(): string {
    if (this.createdDateTo && this.createdDateTo < this.todayDate) {
      return this.createdDateTo;
    }
    return this.todayDate;
  }

  /**
   * Get min date for "to" input (createdDateFrom if set)
   */
  get minDateTo(): string {
    return this.createdDateFrom || '';
  }

  // Status options for dropdown
  statusOptions: { label: string; value: SubmissionStatus }[] = [
    { label: 'Created', value: 'Created' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Under Review', value: 'UnderReview' },
    { label: 'Pending Client Action', value: 'PendingClientAction' },
    { label: 'In Progress', value: 'InProgress' },
    { label: 'Verified', value: 'Verified' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly operationsFacade = inject(OperationsFacadeService);

  // Data properties
  submissionsData = signal<SubmissionViewModel[]>([]);
  totalRecords = 0;
  loading = signal<boolean>(false);

  // Selection state
  isAllSelected = false;
  selectedSubmissionIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadSubmissions();
  }

  /**
   * Load submissions data from API
   */
  private loadSubmissions(): void {
    this.loading.set(true);
    this.operationsFacade
      .getAllServiceSubmissions({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sortColumn: this.sortColumn() || undefined,
        sortDirection: this.sortColumn() ? this.sortDirection() : undefined,
        createdDateFrom: this.createdDateFrom || undefined,
        createdDateTo: this.createdDateTo || undefined,
        status: this.selectedStatus || undefined,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            const data = response.data.items || [];
            this.submissionsData.set(
              data.map((submission) => ({
                ...submission,
                selected: this.selectedSubmissionIds().has(submission.submissionId),
              }))
            );
            this.totalRecords = response.data.totalCount;
            this.updateSelectAllState();
          }
        },
        error: (err) => {
          console.error('Error loading submissions', err);
        },
      });
  }

  /**
   * Handle page change events from PrimeNG table
   */
  onPageChange(event: { first?: number; page?: number; rows: number }): void {
    this.pageNumber =
      event.page !== undefined ? event.page + 1 : Math.floor((event.first ?? 0) / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadSubmissions();
  }

  /**
   * Handle sort events from PrimeNG table
   */
  onSortColumn(event: { field: string; order: number }): void {
    if (!SORTABLE_COLUMNS.includes(event.field as (typeof SORTABLE_COLUMNS)[number])) {
      console.warn(`Sorting not allowed for field: ${event.field}`);
      return;
    }

    this.sortColumn.set(event.field);
    this.sortDirection.set(event.order === 1 ? 'ASC' : 'DESC');
    this.loadSubmissions();
  }

  /**
   * Handle date filter changes
   */
  onDateFilterChange(): void {
    // Validate: if both dates are set, ensure from <= to
    if (this.createdDateFrom && this.createdDateTo && this.createdDateFrom > this.createdDateTo) {
      // Swap dates if from is after to
      [this.createdDateFrom, this.createdDateTo] = [this.createdDateTo, this.createdDateFrom];
    }

    this.pageNumber = 1; // Reset to first page when filtering
    this.loadSubmissions();
  }

  /**
   * Handle status filter changes
   */
  onStatusFilterChange(): void {
    this.pageNumber = 1; // Reset to first page when filtering
    this.loadSubmissions();
  }

  /**
   * Get count of selected submissions
   */
  get selectedSubmissionsCount(): number {
    return this.selectedSubmissionIds().size;
  }

  /**
   * Handle select all checkbox toggle
   */
  onSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    const currentSelectedIds = new Set(this.selectedSubmissionIds());

    this.submissionsData().forEach((submission) => {
      submission.selected = this.isAllSelected;
      if (this.isAllSelected) {
        currentSelectedIds.add(submission.submissionId);
      } else {
        currentSelectedIds.delete(submission.submissionId);
      }
    });

    this.selectedSubmissionIds.set(currentSelectedIds);
  }

  /**
   * Toggle individual submission selection
   */
  toggleSubmissionSelection(submission: SubmissionViewModel): void {
    submission.selected = !submission.selected;

    const currentSelectedIds = new Set(this.selectedSubmissionIds());
    if (submission.selected) {
      currentSelectedIds.add(submission.submissionId);
    } else {
      currentSelectedIds.delete(submission.submissionId);
    }
    this.selectedSubmissionIds.set(currentSelectedIds);

    this.updateSelectAllState();
  }

  /**
   * Update the select all checkbox state
   */
  private updateSelectAllState(): void {
    const currentPageSubmissions = this.submissionsData();
    if (currentPageSubmissions.length === 0) {
      this.isAllSelected = false;
      return;
    }

    this.isAllSelected = currentPageSubmissions.every((submission) => submission.selected);
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selectedSubmissionIds.set(new Set());
    this.submissionsData().forEach((submission) => {
      submission.selected = false;
    });
    this.isAllSelected = false;
  }

  /**
   * Handle search input changes (placeholder - not functional)
   */
  onSearchChange(value: string): void {
    this.search = value.toLowerCase().trim();
    // Search not implemented yet
  }

  /**
   * Export submissions (placeholder - not functional)
   */
  exportSubmissions(): void {
    // Export not implemented yet
    console.log('Export submissions:', Array.from(this.selectedSubmissionIds()));
  }

  /**
   * Add new request (placeholder - not functional)
   */
  addRequest(): void {
    // Add request not implemented yet
    console.log('Add request clicked');
  }

  /**
   * View submission details
   */
  viewSubmission(id: string): void {
    // Navigate to submission details (route to be implemented)
    console.log('View submission:', id);
  }

  /**
   * Edit submission
   */
  editSubmission(id: string): void {
    // Navigate to edit submission (route to be implemented)
    console.log('Edit submission:', id);
  }

  /**
   * Get CSS class for status badge
   */
  getStatusClass(status: SubmissionStatus): string {
    const statusClasses: Record<SubmissionStatus, string> = {
      Created: 'bg-secondary',
      Submitted: 'bg-info',
      UnderReview: 'bg-warning text-dark',
      PendingClientAction: 'bg-warning text-dark',
      InProgress: 'bg-primary',
      Verified: 'bg-success',
      Completed: 'bg-success',
      Cancelled: 'bg-danger',
    };
    return statusClasses[status] || 'bg-secondary';
  }
}
