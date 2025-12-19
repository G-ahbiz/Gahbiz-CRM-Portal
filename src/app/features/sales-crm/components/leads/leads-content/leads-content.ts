import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { TabsHeader } from '@shared/components/tabs-header/tabs-header';
import { LeadsTabel } from '../leads-tabel/leads-tabel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { LogCard } from '@shared/interfaces/log-card';
import { LeadsStatistics } from '@features/sales-crm/interfaces/leads-statistics';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-leads-content',
  standalone: true,
  imports: [CommonModule, TabsHeader, LeadsTabel],
  templateUrl: './leads-content.html',
  styleUrls: ['./leads-content.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsContent implements OnInit, OnDestroy {
  cardsData = signal<LogCard[]>([]);
  isLoading = signal<boolean>(true);
  isMobile = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private leadsFacade = inject(LeadsFacadeService);
  private translate = inject(TranslateService);
  languageService = inject(LanguageService);

  // Computed properties for responsive design
  skeletonCardsCount = computed(() => (this.isMobile() ? 1 : 4));
  cardColumns = computed(() => {
    if (this.isMobile()) return 'col-12';
    if (window.innerWidth < 992) return 'col-12 col-md-6'; // Tablet
    return 'col-12 col-md-6 col-lg-3'; // Desktop
  });

  ngOnInit() {
    this.checkMobileView();
    this.loadStatistics();

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
          if (response?.succeeded) {
            this.cardsData.set(this.mapStatisticsToCards(response.data));
          } else {
            this.showError(response?.message || 'ERROR.FETCH_LEADS_STATISTICS');
            this.cardsData.set(this.getFallbackCardsData());
          }
        },
        error: (error) => {
          console.error('Failed to load leads statistics:', error);
          this.showError(error.message || 'ERROR.FETCH_LEADS_STATISTICS');
          this.cardsData.set(this.getFallbackCardsData());
        },
      });
  }

  private showError(messageKey: string) {
    this.translate.get(messageKey).subscribe((translatedMessage) => {
      this.toast.error(translatedMessage);
    });
  }

  private mapStatisticsToCards(stats: LeadsStatistics): LogCard[] {
    return [
      {
        title: 'LEADS.TOTAL_LEADS',
        value: stats.totalLeads || 0,
        rating: Math.abs(this.formatPercentage(stats.totalChangePercentage || 0)),
        ratingStatues: (stats.totalChangePercentage || 0) >= 0 ? 'up' : 'down',
        icon: 'totalLeads',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'LEADS.NEW_LEADS',
        value: stats.newLeads || 0,
        rating: Math.abs(this.formatPercentage(stats.newChangePercentage || 0)),
        ratingStatues: (stats.newChangePercentage || 0) >= 0 ? 'up' : 'down',
        icon: 'new',
        bgColor: 'bg-success-light',
      },
      {
        title: 'LEADS.QUALIFIED_LEADS',
        value: stats.qualifiedLeads || 0,
        rating: Math.abs(this.formatPercentage(stats.qualifiedChangePercentage || 0)),
        ratingStatues: (stats.qualifiedChangePercentage || 0) >= 0 ? 'up' : 'down',
        icon: 'qualified',
        bgColor: 'bg-warning-light',
      },
      {
        title: 'LEADS.IN_PROGRESS',
        value: stats.inProgressLeads || 0,
        rating: Math.abs(this.formatPercentage(stats.inProgressChangePercentage || 0)),
        ratingStatues: (stats.inProgressChangePercentage || 0) >= 0 ? 'up' : 'down',
        icon: 'inprogress',
        bgColor: 'bg-info-light',
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
        title: 'LEADS.TOTAL_LEADS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'totalLeads',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'LEADS.NEW_LEADS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'new',
        bgColor: 'bg-success-light',
      },
      {
        title: 'LEADS.QUALIFIED_LEADS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'qualified',
        bgColor: 'bg-warning-light',
      },
      {
        title: 'LEADS.IN_PROGRESS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'inprogress',
        bgColor: 'bg-info-light',
      },
    ];
  }

  get containerClass() {
    return this.languageService.getFlexDirectionClass();
  }

  get flexDirection() {
    return this.languageService.isRTL() ? 'rtl' : 'ltr';
  }
}
