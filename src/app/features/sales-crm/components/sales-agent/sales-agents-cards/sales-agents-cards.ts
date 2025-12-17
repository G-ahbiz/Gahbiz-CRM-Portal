import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule } from 'primeng/popover';
import { GetSalesAgentsResponse } from '@features/sales-crm/interfaces/get-sales-agents-response';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@core/services/toast.service';
import { ErrorFacadeService } from '@core/services/error.facade.service';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { SalesAgentsFilter } from '@features/sales-crm/interfaces/sales-agents-filters';
import { SelectModule } from 'primeng/select';
import { AssignTask } from '../assign-task/assign-task';

@Component({
  selector: 'app-sales-agents-cards',
  imports: [CommonModule, TranslateModule, PopoverModule, SelectModule, AssignTask],
  templateUrl: './sales-agents-cards.html',
  styleUrl: './sales-agents-cards.css',
})
export class SalesAgentsCards implements OnInit {
  salesAgents = signal<GetSalesAgentsResponse[]>([]);
  searchValue = signal<string>('');
  assignTaskVisible = signal<boolean>(false);
  loading = signal<boolean>(true);

  // Pagination state
  pageNumber: number = 1;
  pageSize: number = 20;
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);
  hasPreviousPage = signal<boolean>(false);
  hasNextPage = signal<boolean>(false);

  searchTerm = signal<string>('');
  sortDirection = signal<'ASC' | 'DESC' | undefined>(undefined);
  sortColumn = signal<string>('');

  sortOptions = signal<{ name: string; value: string }[]>([
    { name: 'Default', value: '' },
    { name: 'Succeeded Leads', value: 'SucceededLeads' },
    { name: 'On Hold Leads', value: 'OnHoldLeads' },
    { name: 'Total Leads', value: 'TotalLeads' },
  ]);

  private searchSubject = new Subject<string>();

  private readonly salesAgentService = inject(SalesAgentFacadeService);
  private readonly router = inject(Router);
  private readonly toestr = inject(ToastService);
  private readonly errorFacadeService = inject(ErrorFacadeService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.setupSearchSubscription();
    this.getSalesAgents();
  }

  getSalesAgents() {
    this.loading.set(true);

    this.salesAgentService
      .getAllSalesAgents({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        searchTerm: this.searchTerm(),
        sortColumn: this.sortColumn() as 'SucceededLeads' | 'OnHoldLeads' | 'TotalLeads',
        sortDirection: this.sortDirection(),
      } as SalesAgentsFilter)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.salesAgents.set(response.data.items);
            this.totalCount.set(response.data.totalCount);
            this.totalPages.set(response.data.totalPages);
            this.hasPreviousPage.set(response.data.hasPreviousPage);
            this.hasNextPage.set(response.data.hasNextPage);
          } else {
            this.toestr.error(response.message);
          }
        },
        error: (error) => {
          const errorMessage = this.errorFacadeService.getErrorMessage(error);

          if (Array.isArray(errorMessage)) {
            // Display each error from the array
            errorMessage.forEach((msg) => this.toestr.error(msg));
          } else {
            // Display single error message
            this.toestr.error(errorMessage);
          }
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value.trim());
  }

  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue) => {
        this.searchValue.set(searchValue);
        this.searchTerm.set(searchValue);
        this.pageNumber = 1;
        this.getSalesAgents();
      });
  }

  onSortChange(event: any): void {
    this.sortColumn.set(event.value);
    this.getSalesAgents();
  }

  /**
   * Navigate to the previous page
   */
  onPreviousPage(): void {
    if (this.hasPreviousPage()) {
      this.pageNumber--;
      this.getSalesAgents();
    }
  }

  /**
   * Navigate to the next page
   */
  onNextPage(): void {
    if (this.hasNextPage()) {
      this.pageNumber++;
      this.getSalesAgents();
    }
  }

  /**
   * Calculate the start index for the current page
   */
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  /**
   * Calculate the end index for the current page
   */
  getEndIndex(): number {
    const calculatedEnd = this.pageNumber * this.pageSize;
    return calculatedEnd > this.totalCount() ? this.totalCount() : calculatedEnd;
  }

  viewSalesAgent(id: string): void {
    this.router.navigate(['/main/sales/sales-agents/sales-agent-details', id]);
  }

  openAssignTaskDialog() {
    this.assignTaskVisible.set(true);
  }

  closeAssignTaskDialog() {
    this.assignTaskVisible.set(false);
  }
}
