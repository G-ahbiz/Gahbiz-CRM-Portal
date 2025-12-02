import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { InvoiceFacadeService } from '../../services/invoice.facade.service';
import { GetInvoiceetails } from '../../interfaces/get-invoice-details';

@Component({
  selector: 'app-invoice-details',
  imports: [CommonModule, TranslateModule],
  templateUrl: './invoice-details.html',
  styleUrl: './invoice-details.css',
})
export class InvoiceDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly invoiceFacade = inject(InvoiceFacadeService);

  // State signals
  invoice = signal<GetInvoiceetails | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed values for services totals
  servicesTotalQuantity = computed(() => {
    const services = this.invoice()?.services || [];
    return services.reduce((total, service) => total + service.quantity, 0);
  });

  servicesTotalPrice = computed(() => {
    const services = this.invoice()?.services || [];
    return services.reduce((total, service) => total + service.total, 0);
  });

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.loadInvoiceDetails(invoiceId);
    }
  }

  private loadInvoiceDetails(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.invoiceFacade
      .getInvoiceDetails(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.invoice.set(response.data);
          }
        },
        error: (err) => {
          console.error('Error loading invoice details', err);
          this.error.set('Failed to load invoice details');
        },
      });
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    // handle status change
  }

  goBack(): void {
    window.history.back();
  }
}
