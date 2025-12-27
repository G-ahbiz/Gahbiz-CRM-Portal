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
import { SalesAgentsTabel } from '../sales-agents-tabel/sales-agents-tabel';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { LogCard } from '@shared/interfaces/log-card';
import { SalesAgentStatisticsOne } from '@features/sales-crm/interfaces/sales-agent-statistics-one';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sales-agents-details',
  standalone: true,
  imports: [CommonModule, TabsHeader, SalesAgentsTabel, CanvasJSAngularChartsModule],
  templateUrl: './sales-agents-details.html',
  styleUrls: ['./sales-agents-details.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesAgentsDetails implements OnInit {
  // Signals
  cardsData = signal<LogCard[]>([]);
  isLoading = signal<boolean>(true);
  agentDetails = signal<any>({});
  agentStatistics = signal<SalesAgentStatisticsOne | null>(null);
  salesAgentId = signal<string>('');

  // Dependency injection
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private salesAgentFacade = inject(SalesAgentFacadeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Chart options signals
  chartOptionsVertical = signal<any>({
    title: {
      text: 'Leads Performance Over Time',
    },
    animationEnabled: true,
    axisY: {
      includeZero: true,
    },
    data: [
      {
        type: 'column',
        indexLabelFontColor: '#5A5757',
        dataPoints: [
          { x: 10, y: 71 },
          { x: 20, y: 55 },
          { x: 30, y: 50 },
          { x: 40, y: 65 },
          { x: 50, y: 71 },
          { x: 60, y: 92, indexLabel: 'Highest\u2191' },
          { x: 70, y: 68 },
          { x: 80, y: 38, indexLabel: 'Lowest\u2193' },
          { x: 90, y: 54 },
          { x: 100, y: 60 },
        ],
      },
    ],
  });

  chartOptionsHorizontal = signal<any>({
    animationEnabled: true,
    title: {
      text: 'Conversion Rate',
    },
    data: [
      {
        type: 'doughnut',
        yValueFormatString: "#,###.##'%'",
        indexLabel: '{name}',
        dataPoints: [
          { y: 75, name: 'Success' },
          { y: 25, name: 'Remaining' },
        ],
      },
    ],
  });

  ngOnInit() {
    this.loadAgentDetails();
  }

  loadAgentDetails() {
    this.isLoading.set(true);

    const salesAgentId = this.route.snapshot.paramMap.get('id');
    console.log('SalesAgentsDetails: route salesAgentId =', salesAgentId);

    if (!salesAgentId) {
      this.toast.error('No agent ID found');
      this.cardsData.set(this.getFallbackCardsData());
      this.isLoading.set(false);
      return;
    }

    this.salesAgentId.set(salesAgentId);

    const nav = this.router.getCurrentNavigation?.();
    const navState = nav?.extras?.state ?? (window.history && (window.history.state || {}));

    const nameFromState = navState?.name;
    const imageFromState = navState?.imageUrl;

    this.agentDetails.set({
      name: nameFromState ?? 'Agent',
      profession: 'Sales Agent',
      imageUrl: imageFromState ?? 'assets/images/salesAgents/photo2.svg',
    });

    this.loadStatistics(salesAgentId);
  }

  loadStatistics(agentId: string) {
    this.salesAgentFacade
      .getSalesAgentStatisticsById(agentId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: ApiResponse<SalesAgentStatisticsOne>) => {
          if (response && response.succeeded) {
            this.agentStatistics.set(response.data);
            this.cardsData.set(this.mapStatisticsToCards(response.data));
            //this.updateChartsWithData(response.data);
          } else {
            this.toast.error(response?.message || 'Error fetching agent statistics');
            this.cardsData.set(this.getFallbackCardsData());
          }
        },
        error: (error) => {
          console.error('Failed to load agent statistics:', error);
          this.toast.error(error.message || 'Error fetching agent statistics');
          this.cardsData.set(this.getFallbackCardsData());
        },
      });
  }

  private mapStatisticsToCards(stats: SalesAgentStatisticsOne): LogCard[] {
    return [
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.TOTAL_LEADS',
        value: stats.totalLeadsAssigned,
        // rating: 2, // You can calculate this based on previous period if available
        //ratingStatues: 'up',
        icon: 'totalLeads',
        bgColor: 'card-blue',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.CONVERTED_LEADS',
        value: stats.convertedLeadsCount,
        rating: this.formatPercentage(stats.conversionRatePercent),
        ratingStatues: stats.conversionRatePercent >= 0 ? 'up' : 'down',
        icon: 'convertedLeads',
        bgColor: 'card-green',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.MONTHLY_TARGET',
        value: stats.monthlyTarget,
        //rating: 0,
        //ratingStatues: stats.revenueAchieved >= stats.monthlyTarget ? 'up' : 'down',
        icon: 'monthlyTarget',
        bgColor: 'card-yellow',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.REVENUE_ACHIEVED',
        value: stats.revenueAchieved,
        rating: this.formatPercentage(stats.revenueAchieved),
        ratingStatues: stats.revenueAchieved >= stats.monthlyTarget ? 'up' : 'down',
        icon: 'revenueAchieved',
        bgColor: 'card-red',
      },
    ];
  }

  private formatPercentage(value: number): number {
    // Format to 1 decimal place
    return Math.round(Math.abs(value) * 10) / 10;
  }

  /*private updateChartsWithData(statistics: SalesAgentStatisticsOne) {
    // Update horizontal chart with conversion rate
    this.chartOptionsHorizontal.set({
      ...this.chartOptionsHorizontal(),
      data: [
        {
          type: 'doughnut',
          yValueFormatString: "#,###.##'%'",
          indexLabel: '{name}: {y}%',
          dataPoints: [
            {
              y: statistics.conversionRatePercent || 0,
              name: 'Conversion Rate',
            },
            {
              y: Math.max(0, 100 - (statistics.conversionRatePercent || 0)),
              name: 'Remaining',
            },
          ],
        },
      ],
    });

    // Optional: Update vertical chart with actual data if you have historical data
    // For now, we keep the dummy data
  }*/

  private getFallbackCardsData(): LogCard[] {
    return [
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.TOTAL_LEADS',
        value: 0,
        rating: 0.0,
        ratingStatues: 'up',
        icon: 'totalLeads',
        bgColor: 'card-blue',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.CONVERTED_LEADS',
        value: 0,
        rating: 0.0,
        ratingStatues: 'up',
        icon: 'convertedLeads',
        bgColor: 'card-green',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.MONTHLY_TARGET',
        value: 0,
        rating: 0.0,
        ratingStatues: 'down',
        icon: 'monthlyTarget',
        bgColor: 'card-yellow',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.REVENUE_ACHIEVED',
        value: 0,
        rating: 0.0,
        ratingStatues: 'down',
        icon: 'revenueAchieved',
        bgColor: 'card-red',
      },
    ];
  }

  goBack() {
    window.history.back();
  }
}
