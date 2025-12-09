import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TabsHeader } from '@shared/components/tabs-header/tabs-header';
import { LeadsTabel } from '../leads-tabel/leads-tabel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { LogCard } from '@shared/interfaces/log-card';
import { LeadsStatistics } from '@features/sales-crm/interfaces/leads-statistics';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';

@Component({
  selector: 'app-leads-content',
  standalone: true,
  imports: [CommonModule, TabsHeader, LeadsTabel],
  templateUrl: './leads-content.html',
  styleUrls: ['./leads-content.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsContent implements OnInit {
  cardsData = signal<LogCard[]>([]);
  isLoading = signal<boolean>(true);

  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private leadsFacade = inject(LeadsFacadeService);

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading.set(true);
    this.leadsFacade
      .getStatistics()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response && response.succeeded) {
            this.cardsData.set(this.mapStatisticsToCards(response.data));
          } else {
            this.toast.error(response.message || 'Error fetching leads statistics');
            this.cardsData.set(this.getFallbackCardsData());
          }
        },
        error: (error) => {
          console.error('Failed to load leads statistics:', error);
          this.toast.error(error.message || 'Error fetching leads statistics');
          this.cardsData.set(this.getFallbackCardsData());
        },
      });
  }

  private mapStatisticsToCards(stats: LeadsStatistics): LogCard[] {
    return [
      {
        title: 'Total Leads',
        value: stats.totalLeads,
        rating: this.formatPercentage(stats.totalChangePercentage),
        ratingStatues: stats.totalChangePercentage >= 0 ? 'up' : 'down',
        icon: 'totalLeads',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'New Leads',
        value: stats.newLeads,
        rating: this.formatPercentage(stats.newChangePercentage),
        ratingStatues: stats.newChangePercentage >= 0 ? 'up' : 'down',
        icon: 'new',
        bgColor: 'bg-success-light',
      },
      {
        title: 'Qualified Leads',
        value: stats.qualifiedLeads,
        rating: this.formatPercentage(stats.qualifiedChangePercentage),
        ratingStatues: stats.qualifiedChangePercentage >= 0 ? 'up' : 'down',
        icon: 'qualified', // or 'approved'
        bgColor: 'bg-warning-light',
      },
      {
        title: 'In Progress',
        value: stats.inProgressLeads,
        rating: this.formatPercentage(stats.inProgressChangePercentage),
        ratingStatues: stats.inProgressChangePercentage >= 0 ? 'up' : 'down',
        icon: 'inprogress', // or 'progress'
        bgColor: 'bg-info-light',
      },
    ];
  }

  private formatPercentage(value: number): number {
    // Format to 1 decimal place
    return Math.round(Math.abs(value) * 10) / 10;
  }

  private getFallbackCardsData(): LogCard[] {
    return [
      {
        title: 'Total Leads',
        value: 0,
        rating: 0.0,
        ratingStatues: 'up',
        icon: 'totalLeads',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'New Leads',
        value: 0,
        rating: 0.0,
        ratingStatues: 'up',
        icon: 'new',
        bgColor: 'bg-success-light',
      },
      {
        title: 'Qualified Leads',
        value: 0,
        rating: 0.0,
        ratingStatues: 'up',
        icon: 'qualified',
        bgColor: 'bg-warning-light',
      },
      {
        title: 'In Progress',
        value: 0,
        rating: 0.0,
        ratingStatues: 'up',
        icon: 'inprogress',
        bgColor: 'bg-info-light',
      },
    ];
  }
}
