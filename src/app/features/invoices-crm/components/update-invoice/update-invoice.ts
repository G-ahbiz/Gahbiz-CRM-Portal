import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { InvoiceFacadeService } from '../../services/invoice.facade.service';
import { GetInvoiceetails } from '../../interfaces/get-invoice-details';
import { UpdateInvoiceRequest } from '../../interfaces/update-invoice-request';
import { ErrorFacadeService } from '@core/services/error.facade.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-update-invoice',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './update-invoice.html',
  styleUrl: './update-invoice.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateInvoice implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly invoiceFacade = inject(InvoiceFacadeService);
  private readonly errorFacadeService = inject(ErrorFacadeService);
  private readonly toastService = inject(ToastService);

  // State signals
  invoice = signal<GetInvoiceetails | null>(null);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);

  // Invoice ID from route
  private invoiceId: string | null = null;

  // Reactive form
  updateInvoiceForm: FormGroup = this.fb.group({
    amountPaid: [0, [Validators.required, Validators.min(0)]],
    status: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    if (this.invoiceId) {
      this.loadInvoiceDetails(this.invoiceId);
    }
  }

  private loadInvoiceDetails(id: string): void {
    this.loading.set(true);

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
            this.prefillForm(response.data);
          }
        },
        error: (err) => {
          console.error('Error loading invoice details', err);
          this.toastService.error('Failed to load invoice details');
        },
      });
  }

  private prefillForm(invoice: GetInvoiceetails): void {
    this.updateInvoiceForm.patchValue({
      amountPaid: invoice.amountPaid,
      status: invoice.status,
      notes: invoice.notes || '',
    });
  }

  checkValidity(control: string): string {
    const formControl = this.updateInvoiceForm.get(control);
    return formControl?.valid && !formControl?.errors?.['required']
      ? 'text-success'
      : 'text-danger';
  }

  updateInvoice(): void {
    if (this.updateInvoiceForm.invalid || !this.invoiceId) {
      this.updateInvoiceForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const request: UpdateInvoiceRequest = {
      amountPaid: this.updateInvoiceForm.value.amountPaid,
      status: this.updateInvoiceForm.value.status,
      notes: this.updateInvoiceForm.value.notes || undefined,
    };

    this.invoiceFacade
      .updateInvoiceDetails(this.invoiceId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.invoice.set(response.data);
            this.toastService.success('Invoice updated successfully');
            this.goBack();
          } else {
            const errorMsg = this.errorFacadeService.handleApiResponse(response);
            this.toastService.error(errorMsg);
          }
        },
        error: (err) => {
          console.error('Error updating invoice', err);
          this.toastService.error('Error updating invoice');
        },
      });
  }

  cancel(): void {
    this.goBack();
  }

  goBack(): void {
    window.history.back();
  }
}
