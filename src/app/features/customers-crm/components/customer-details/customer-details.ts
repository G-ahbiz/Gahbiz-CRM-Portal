import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { CustomersFacadeService } from '../../services/customers-facade.service';
import { CustomerDetailsResponse } from '../../interfaces/customer-details-response';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-customer-details',
  imports: [CommonModule, TranslateModule, DialogModule],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css',
})
export class CustomerDetails implements OnChanges {
  @Input() customerId: string | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  private readonly customersFacade = inject(CustomersFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  customer = signal<CustomerDetailsResponse | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && this.customerId && changes['visible']?.currentValue === true) {
      this.loadCustomerDetails(this.customerId);
    } else if (changes['visible'] && this.visible && this.customerId) {
      this.loadCustomerDetails(this.customerId);
    }
  }

  private loadCustomerDetails(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.customer.set(null);

    this.customersFacade
      .getCustomerDetails(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.customer.set(response.data);
          } else {
            this.error.set(response.message || 'Failed to load customer details');
            this.toast.error(this.error()!);
          }
        },
        error: (err) => {
          console.error('Error loading customer details', err);
          this.error.set('Failed to load customer details');
          this.toast.error(this.error()!);
        },
      });
  }

  getFullName(): string {
    const customer = this.customer();
    if (!customer) return '';
    return `${customer.firstName} ${customer.lastName}`.trim();
  }

  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onClose.emit();
    this.customer.set(null);
    this.error.set(null);
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.onClose.emit();
    this.customer.set(null);
    this.error.set(null);
  }
}
