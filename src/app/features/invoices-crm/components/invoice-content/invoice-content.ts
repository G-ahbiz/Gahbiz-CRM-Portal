import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { InvoicesTabel } from '../invoices-tabel/invoices-tabel';
import { TabsHeader } from '@shared/components/tabs-header/tabs-header';
import { InvoicesStatistics } from '@features/invoices-crm/interfaces/statistics';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { InvoiceFacadeService } from '@features/invoices-crm/services/invoice.facade.service';
import { LogCard } from '@shared/interfaces/log-card';

@Component({
  selector: 'app-invoice-content',
  imports: [CommonModule, TabsHeader, InvoicesTabel],
  templateUrl: './invoice-content.html',
  styleUrl: './invoice-content.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceContent implements OnInit {
  cardsData = signal<LogCard[]>([]);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private invoiceFacade = inject(InvoiceFacadeService);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.getCardsData();
  }

  getCardsData() {
    this.invoiceFacade
      .getStatistics()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response && response.succeeded) {
            this.cardsData.set(this.mapStatisticsToCards(response.data));
          } else {
            this.toast.error(response.message || 'Error fetching invoices statistics');
          }
        },
        error: (error) => {
          this.toast.error(error.message || 'Error fetching invoices statistics');
        },
      });
  }

  private mapStatisticsToCards(stats: InvoicesStatistics): LogCard[] {
    return [
      {
        title: 'Total Invoices',
        value: stats.totalInvoices,
        icon: 'totalInvoices',
        bgColor: 'bg-primary-light',
        rating: Math.abs(stats.totalChangePercentage),
        ratingStatues: stats.totalChangePercentage >= 0 ? 'up' : 'down',
      },
      {
        title: 'Paid',
        value: stats.paidInvoices,
        icon: 'paid',
        bgColor: 'bg-success-light',
        rating: Math.abs(stats.paidChangePercentage),
        ratingStatues: stats.paidChangePercentage >= 0 ? 'up' : 'down',
      },
      {
        title: 'Partially Paid',
        value: stats.partiallyPaidInvoices,
        icon: 'partiallyPaid',
        bgColor: 'bg-warning-light',
        rating: Math.abs(stats.partiallyPaidChangePercentage),
        ratingStatues: stats.partiallyPaidChangePercentage >= 0 ? 'up' : 'down',
      },
      {
        title: 'Unpaid',
        value: stats.unpaidInvoices,
        icon: 'unpaid',
        bgColor: 'bg-danger-light',
        rating: Math.abs(stats.unpaidChangePercentage),
        ratingStatues: stats.unpaidChangePercentage >= 0 ? 'up' : 'down',
      },
    ];
  }
}
