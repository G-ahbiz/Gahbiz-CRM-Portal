import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { InvoiceFacadeService } from '../../services/invoice.facade.service';
import { GetInvoiceetails } from '../../interfaces/get-invoice-details';
import { HttpResponse } from '@angular/common/http';

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
  downloadLoading = signal<boolean>(false);
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

  downloadInvoice(): void {
    const invoice = this.invoice();
    if (!invoice?.id) return;

    this.downloadLoading.set(true);

    this.invoiceFacade
      .downloadInvoice(invoice.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.downloadLoading.set(false))
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          // Handle the HttpResponse<Blob> response
          this.handleDownloadResponse(response, invoice);
        },
        error: (err) => {
          console.error('Error downloading invoice', err);
          this.error.set('Failed to download invoice. Please try again.');
        },
      });
  }

  private handleDownloadResponse(response: HttpResponse<Blob>, invoice: GetInvoiceetails): void {
    const blob = response.body;
    if (!blob) {
      this.error.set('No invoice data found');
      return;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Try to get filename from content-disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `Invoice_${invoice.invoiceNumber}.pdf`;

    if (contentDisposition) {
      // Handle different formats of content-disposition header
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');

        // Handle UTF-8 encoded filenames (filename*=UTF-8'' format)
        if (filename.startsWith("UTF-8''")) {
          filename = decodeURIComponent(filename.substring(7));
        }
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  goBack(): void {
    window.history.back();
  }
}
