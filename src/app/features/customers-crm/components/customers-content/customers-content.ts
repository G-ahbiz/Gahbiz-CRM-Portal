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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { LogCard } from '@shared/interfaces/log-card';
import { CustomersStatistics } from '@features/customers-crm/interfaces/customers-statistics';
import { CustomersFacadeService } from '@features/customers-crm/services/customers-facade.service';
import { CustomerTabel } from '../customer-tabel/customer-tabel';

@Component({
  selector: 'app-customer-content',
  standalone: true,
  imports: [CommonModule, TabsHeader, CustomerTabel],
  templateUrl: './customers-content.html',
  styleUrls: ['./customers-content.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerContent implements OnInit {
  cardsData = signal<LogCard[]>([]);
  isLoading = signal<boolean>(true);

  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private customersFacade = inject(CustomersFacadeService);

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading.set(true);
    this.customersFacade
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
            this.toast.error(response.message || 'Error fetching customer statistics');
            this.cardsData.set(this.getFallbackCardsData());
          }
        },
        error: (error) => {
          console.error('Failed to load customer statistics:', error);
          this.toast.error(error.message || 'Error fetching customer statistics');
          this.cardsData.set(this.getFallbackCardsData());
        },
      });
  }

  private mapStatisticsToCards(stats: CustomersStatistics): LogCard[] {
    return [
      {
        title: 'Total Customers',
        value: stats.toltalCustomers,
        rating: Math.abs(this.formatPercentage(stats.customersChangePercentage)),
        ratingStatues: stats.customersChangePercentage >= 0 ? 'up' : 'down',
        icon: 'totalCustomers',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'Total Leads',
        value: stats.totlaLeads,
        rating: Math.abs(this.formatPercentage(stats.leadsChangePercentage)),
        ratingStatues: stats.leadsChangePercentage >= 0 ? 'up' : 'down',
        icon: 'leads',
        bgColor: 'bg-success-light',
      },
      {
        title: 'Total Users',
        value: stats.totalUsers,
        rating: Math.abs(this.formatPercentage(stats.usersChangePercentage)),
        ratingStatues: stats.usersChangePercentage >= 0 ? 'up' : 'down',
        icon: 'users',
        bgColor: 'bg-warning-light',
      },
    ];
  }

  private formatPercentage(value: number): number {
    // Round to 1 decimal place
    return Math.round(value * 10) / 10;
  }

  private getFallbackCardsData(): LogCard[] {
    return [
      {
        title: 'Total Customers',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'users',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'Total Leads',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'userPlus',
        bgColor: 'bg-success-light',
      },
      {
        title: 'Total Users',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'userGroup',
        bgColor: 'bg-warning-light',
      },
    ];
  }
}
