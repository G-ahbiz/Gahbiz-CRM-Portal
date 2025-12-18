import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TabsHeader } from '@shared/components/tabs-header/tabs-header';
import { LogCard } from '@shared/interfaces/log-card';
import { AllData } from 'app/services/all-data';
import { OperationsTable } from '../../components/operations-table/operations-table';
import { OperationsFacadeService } from '@features/operations/services/operations.facade.service';
import { SubmissionsStatistics } from '@features/operations/interfaces/submissions-statistics';
import { ToastService } from '@core/services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorFacadeService } from '@core/services/error.facade.service';

@Component({
  selector: 'app-operations-content',
  imports: [TabsHeader, OperationsTable],
  templateUrl: './operations-content.html',
  styleUrl: './operations-content.css',
})
export class OperationsContent {
  cardsData = signal<LogCard[]>([]);
  operationsFacade = inject(OperationsFacadeService);
  toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  errorFacade = inject(ErrorFacadeService);
  constructor(private allData: AllData) {}

  ngOnInit() {
    this.getOperationsData();
  }

  getOperationsData() {
    this.operationsFacade
      .getSubmissionsStatistics()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response && response.succeeded && response.data) {
            this.cardsData.set(this.mapStatisticsToCards(response.data));
          } else {
            this.toast.error(response.message || 'Error fetching submissions statistics');
          }
        },
        error: (error) => {
          this.errorFacade.showError(error);
        },
      });
  }

  mapStatisticsToCards(statistics: SubmissionsStatistics): LogCard[] {
    return [
      {
        title: 'Assigned Requests',
        value: statistics.assignedRequests,
        icon: 'requests',
        bgColor: 'card-blue',
        rating: Math.abs(statistics.assignmentRate),
        ratingStatues: statistics.assignmentRate >= 0 ? 'up' : 'down',
      },
      {
        title: 'Completed Requests',
        value: statistics.completedRequests,
        icon: 'completed',
        bgColor: 'card-green',
        rating: Math.abs(statistics.completionRate),
        ratingStatues: statistics.completionRate >= 0 ? 'up' : 'down',
      },
      {
        title: 'Pending Requests',
        value: statistics.pendingRequests,
        icon: 'pending',
        bgColor: 'card-yellow',
        rating: Math.abs(statistics.pendingRate),
        ratingStatues: statistics.pendingRate >= 0 ? 'up' : 'down',
      },
      {
        title: 'Avg. Processing Time',
        value: statistics.avgProcessingTime,
        icon: 'processing',
        bgColor: 'card-red',
        rating: Math.abs(statistics.avgProcessingTime),
        ratingStatues: statistics.avgProcessingTime >= 0 ? 'up' : 'down',
      },
    ];
  }
}
