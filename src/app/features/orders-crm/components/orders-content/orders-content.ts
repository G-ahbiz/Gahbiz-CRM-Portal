import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsHeader } from '../../../../shared/components/tabs-header/tabs-header';
import { OrdersTabel } from '../orders-tabel/orders-tabel';
import { LogCard } from '../../../../shared/interfaces/log-card';
import { StatisticsResponse } from '@features/orders-crm/interfaces/statistics-response';
import { OrdersFacadeService } from '@features/orders-crm/services/orders-facade.service';

@Component({
  selector: 'app-orders-content',
  imports: [CommonModule, TabsHeader, OrdersTabel],
  templateUrl: './orders-content.html',
  styleUrl: './orders-content.css',
})
export class OrdersContent implements OnInit {
  cardsData: LogCard[] = [];
  isLoading = true;

  private ordersFacadeService = inject(OrdersFacadeService);

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading = true;
    this.ordersFacadeService.getStatistics().subscribe({
      next: (statistics: StatisticsResponse) => {
        this.cardsData = this.mapStatisticsToCards(statistics);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load statistics:', error);
        this.isLoading = false;
        this.cardsData = this.getFallbackCardsData();
      },
    });
  }

  private mapStatisticsToCards(statistics: StatisticsResponse): LogCard[] {
    return [
      {
        title: 'Total Orders',
        value: statistics.totalOrders,
        rating: statistics.totalChangePercentage,
        ratingStatues: statistics.totalChangePercentage >= 0 ? 'up' : 'down',
        icon: 'cube',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'Confirmed',
        value: statistics.confirmedOrders,
        rating: statistics.confirmedChangePercentage,
        ratingStatues: statistics.confirmedChangePercentage >= 0 ? 'up' : 'down',
        icon: 'checkCircle',
        bgColor: 'bg-success-light',
      },
      {
        title: 'Pending',
        value: statistics.pendingOrders,
        rating: statistics.pendingChangePercentage,
        ratingStatues: statistics.pendingChangePercentage >= 0 ? 'up' : 'down',
        icon: 'clock',
        bgColor: 'bg-warning-light',
      },
      {
        title: 'Cancelled',
        value: statistics.cancelledOrders,
        rating: statistics.cancelledChangePercentage,
        ratingStatues: statistics.cancelledChangePercentage >= 0 ? 'up' : 'down',
        icon: 'xCircle',
        bgColor: 'bg-danger-light',
      },
    ];
  }

  private getFallbackCardsData(): LogCard[] {
    return [
      {
        title: 'Total Orders',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'cube',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'Confirmed',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'checkCircle',
        bgColor: 'bg-success-light',
      },
      {
        title: 'Pending',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'clock',
        bgColor: 'bg-warning-light',
      },
      {
        title: 'Cancelled',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'xCircle',
        bgColor: 'bg-danger-light',
      },
    ];
  }
}
