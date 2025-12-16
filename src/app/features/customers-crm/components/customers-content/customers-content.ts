import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
  effect,
} from '@angular/core';
import { TabsHeader } from '@shared/components/tabs-header/tabs-header';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { LogCard } from '@shared/interfaces/log-card';
import { CustomersStatistics } from '@features/customers-crm/interfaces/customers-statistics';
import { CustomersFacadeService } from '@features/customers-crm/services/customers-facade.service';
import { CustomerTabel } from '../customer-tabel/customer-tabel';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';

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
  isMobile = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private customersFacade = inject(CustomersFacadeService);
  languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  // Computed properties for responsive design
  skeletonCardsCount = computed(() => (this.isMobile() ? 1 : 3));
  cardColumns = computed(() => (this.isMobile() ? 'col-12' : 'col-12 col-md-6 col-lg-4'));

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
    this.customersFacade
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
            this.showError(response?.message || 'ERROR.FETCH_CUSTOMER_STATISTICS');
            this.cardsData.set(this.getFallbackCardsData());
          }
        },
        error: (error) => {
          console.error('Failed to load customer statistics:', error);
          this.showError(error.message || 'ERROR.FETCH_CUSTOMER_STATISTICS');
          this.cardsData.set(this.getFallbackCardsData());
        },
      });
  }

  private showError(messageKey: string) {
    this.translate.get(messageKey).subscribe((translatedMessage) => {
      this.toast.error(translatedMessage);
    });
  }

  private mapStatisticsToCards(stats: CustomersStatistics): LogCard[] {
    return [
      {
        title: 'CUSTOMERS-CRM.TOTAL_CUSTOMERS', // Translation key
        value: stats.toltalCustomers || 0,
        rating: Math.abs(this.formatPercentage(stats.customersChangePercentage || 0)),
        ratingStatues: (stats.customersChangePercentage || 0) >= 0 ? 'up' : 'down',
        icon: 'totalCustomers',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'CUSTOMERS-CRM.TOTAL_LEADS', // Translation key
        value: stats.totlaLeads || 0,
        rating: Math.abs(this.formatPercentage(stats.leadsChangePercentage || 0)),
        ratingStatues: (stats.leadsChangePercentage || 0) >= 0 ? 'up' : 'down',
        icon: 'leads',
        bgColor: 'bg-success-light',
      },
      {
        title: 'CUSTOMERS-CRM.TOTAL_USERS', // Translation key
        value: stats.totalUsers || 0,
        rating: Math.abs(this.formatPercentage(stats.usersChangePercentage || 0)),
        ratingStatues: (stats.usersChangePercentage || 0) >= 0 ? 'up' : 'down',
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
        title: 'CUSTOMERS-CRM.TOTAL_CUSTOMERS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'totalCustomers',
        bgColor: 'bg-primary-light',
      },
      {
        title: 'CUSTOMERS-CRM.TOTAL_LEADS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'leads',
        bgColor: 'bg-success-light',
      },
      {
        title: 'CUSTOMERS-CRM.TOTAL_USERS',
        value: 0,
        rating: 0,
        ratingStatues: 'up',
        icon: 'users',
        bgColor: 'bg-warning-light',
      },
    ];
  }

  get containerClass() {
    return this.languageService.getFlexDirectionClass();
  }
}
