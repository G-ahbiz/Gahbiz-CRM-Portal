import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { TabsHeader } from '../../../../../shared/components/tabs-header/tabs-header';
import { SalesAgentsCards } from '../sales-agents-cards/sales-agents-cards';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { LogCard } from '../../../../../shared/interfaces/log-card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';
import { SalesAgentStatistics } from '@features/sales-crm/interfaces/sales-agent-statistics';

@Component({
  selector: 'app-sales-agent-content',
  standalone: true,
  imports: [CommonModule, SalesAgentsCards, TabsHeader],
  templateUrl: './sales-agent-content.html',
  styleUrls: ['./sales-agent-content.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesAgentContent implements OnInit {
  cardsData = signal<LogCard[]>([]);
  isLoading = signal<boolean>(true);
  isMobile = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);
  private statisticsFacade = inject(SalesAgentFacadeService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  languageService = inject(LanguageService);

  // Computed properties for responsive design
  skeletonCardsCount = computed(() => (this.isMobile() ? 1 : 3));
  cardColumns = computed(() => (this.isMobile() ? 'col-12' : 'col-12 col-md-6 col-lg-4'));

  ngOnInit() {
    this.checkMobileView();
    this.loadTeamStatistics();

    // Listen to window resize for responsiveness
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
    this.checkMobileView();
  }

  private checkMobileView() {
    this.isMobile.set(window.innerWidth < 768);
  }

  loadTeamStatistics() {
    this.isLoading.set(true);
    this.statisticsFacade
      .getSalesAgentStatistics()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response?.succeeded) {
            this.cardsData.set(this.mapSalesAgentStatisticsToCards(response.data));
          } else {
            this.showError(response?.message || 'ERROR.FETCH_TEAM_STATISTICS');
            this.cardsData.set(this.getFallbackCardsData());
          }
        },
        error: (error) => {
          console.error('Failed to load team statistics:', error);
          this.showError(error.message || 'ERROR.FETCH_TEAM_STATISTICS');
          this.cardsData.set(this.getFallbackCardsData());
        },
      });
  }

  private showError(messageKey: string) {
    this.translate.get(messageKey).subscribe((translatedMessage) => {
      this.toast.error(translatedMessage);
    });
  }

  private mapSalesAgentStatisticsToCards(stats: SalesAgentStatistics): LogCard[] {
    return [
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.TOTAL_AGENTS',
        value: stats.totalAgents || 0,
        rating: this.formatPercentage(stats.totalAgentsPercentage || 0),
        ratingStatues: stats.totalAgentsPercentage >= 0 ? 'up' : 'down',
        icon: 'totalAgents',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.ACTIVE_AGENTS',
        value: stats.activeAgents || 0,
        rating: this.formatPercentage(stats.activeAgentsPercentage || 0),
        ratingStatues: stats.activeAgentsPercentage >= 0 ? 'up' : 'down',
        icon: 'activeMembers',
        bgColor: 'bg-success-light',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.INACTIVE_AGENTS',
        value: stats.inactiveAgents || 0,
        rating: this.formatPercentage(stats.inactiveAgentsPercentage || 0),
        ratingStatues: stats.inactiveAgentsPercentage >= 0 ? 'up' : 'down',
        icon: 'inactiveMembers',
        bgColor: 'bg-warning-light',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.TOTAL_LEADS',
        value: stats.totalLeads || 0,
        rating: this.formatPercentage(stats.totalLeadsPercentage || 0),
        ratingStatues: stats.totalLeadsPercentage >= 0 ? 'up' : 'down',
        icon: 'totalLeads',
        bgColor: 'bg-info-light',
      },
    ];
  }

  private formatPercentage(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private getFallbackCardsData(): LogCard[] {
    return [
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.TOTAL_AGENTS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'totalAgents',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.ACTIVE_AGENTS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'activeMembers',
        bgColor: 'bg-success-light',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.INACTIVE_AGENTS',
        value: 0,
        rating: 0,
        ratingStatues: 'down',
        icon: 'inactiveMembers',
        bgColor: 'bg-warning-light',
      },
      {
        title: 'SALES-CRM.SALES-AGENTS-CARDS.TOTAL_LEADS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'totalLeads',
        bgColor: 'bg-info-light',
      },
    ];
  }

  get containerClass() {
    return this.languageService.getFlexDirectionClass();
  }
}
