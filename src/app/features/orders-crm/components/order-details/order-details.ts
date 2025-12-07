import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { OrderDetails } from '../../interfaces/order-details';
import { OrdersFacadeService } from '@features/orders-crm/services/orders-facade.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './order-details.html',
  styleUrls: ['./order-details.css'],
})
export class OrderDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderFacade = inject(OrdersFacadeService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  // State signals
  order = signal<OrderDetails | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  currentNote = signal<string>('');
  selectedItems = signal<string[]>([]);
  allItemsSelected = signal<boolean>(false);

  // Computed values for order totals
  itemsTotalQuantity = computed(() => {
    const items = this.order()?.orderItems || [];
    return items.reduce((total, item) => total + item.quantity, 0);
  });

  itemsTotalPrice = computed(() => {
    const items = this.order()?.orderItems || [];
    return items.reduce((total, item) => total + item.total, 0);
  });

  // Helper method to get status class
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get translated status
  getStatusTranslation(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'orders-crm.order-details.pending',
      processing: 'orders-crm.order-details.processing',
      completed: 'orders-crm.order-details.completed',
      cancelled: 'orders-crm.order-details.cancelled',
      paid: 'orders-crm.order-details.paid',
      unpaid: 'orders-crm.order-details.unpaid',
      failed: 'orders-crm.order-details.failed',
    };

    const key = statusMap[status.toLowerCase()] || status;
    return this.translate.instant(key);
  }

  // Helper method to get payment status class
  getPaymentStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get translated payment status
  getPaymentStatusTranslation(status: string): string {
    const statusMap: { [key: string]: string } = {
      paid: 'orders-crm.order-details.paid',
      pending: 'orders-crm.order-details.pending',
      failed: 'orders-crm.order-details.failed',
    };

    const key = statusMap[status.toLowerCase()] || status;
    return this.translate.instant(key);
  }

  // Get translated payment method
  getPaymentMethodTranslation(method: string): string {
    const methodMap: { [key: string]: string } = {
      creditcard: 'orders-crm.order-details.credit-card',
      debitcard: 'orders-crm.order-details.debit-card',
      paypal: 'orders-crm.order-details.paypal',
      banktransfer: 'orders-crm.order-details.bank-transfer',
      cash: 'orders-crm.order-details.cash',
    };

    const key = methodMap[method.toLowerCase()] || method;
    return this.translate.instant(key);
  }

  // Table selection methods
  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allItemsSelected.set(checked);

    if (checked && this.order()?.orderItems) {
      const allIds = this.order()!.orderItems.map((item) => item.id);
      this.selectedItems.set(allIds);
    } else {
      this.selectedItems.set([]);
    }
  }

  isItemSelected(itemId: string): boolean {
    return this.selectedItems().includes(itemId);
  }

  toggleItemSelection(itemId: string): void {
    if (this.isItemSelected(itemId)) {
      this.selectedItems.set(this.selectedItems().filter((id) => id !== itemId));
    } else {
      this.selectedItems.set([...this.selectedItems(), itemId]);
    }

    // Update "select all" checkbox state
    if (this.order()?.orderItems) {
      const allSelected = this.order()!.orderItems.length === this.selectedItems().length;
      this.allItemsSelected.set(allSelected);
    }
  }

  updateQuantity(itemId: string, change: number): void {
    if (!this.order()?.orderItems) return;

    const updatedItems = this.order()!.orderItems.map((item) => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return {
          ...item,
          quantity: newQuantity,
          total: item.price * newQuantity,
        };
      }
      return item;
    });

    this.order.set({
      ...this.order()!,
      orderItems: updatedItems,
    });

    // Update the order amount
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
    this.order.set({
      ...this.order()!,
      amount: totalAmount,
    });

    this.toast.success(this.translate.instant('orders-crm.order-details.quantity-updated'));
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(orderId);
    }
  }

  private loadOrderDetails(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderFacade
      .getOrderById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.order.set({ ...response.data, id });

            this.loadNote(id);
          } else {
            this.error.set(this.translate.instant('orders-crm.order-details.order-not-found'));
          }
        },
        error: (err) => {
          console.error('Error loading order details', err);
          this.error.set(this.translate.instant('orders-crm.order-details.load-error'));
          this.toast.error(this.translate.instant('orders-crm.order-details.load-error'));
        },
      });
  }

  private loadNote(orderId: string): void {
    const savedNote = localStorage.getItem(`order-note-${orderId}`);
    if (savedNote) {
      this.currentNote.set(savedNote);
    }
  }

  saveNote(): void {
    if (!this.order()) return;

    const orderId = this.order()?.id || '';
    localStorage.setItem(`order-note-${orderId}`, this.currentNote());
    this.toast.success(this.translate.instant('orders-crm.order-details.note-saved'));
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;

    if (this.order()) {
      const updatedOrder = { ...this.order()!, status: newStatus };
      this.order.set(updatedOrder);

      this.toast.success(
        this.translate.instant('orders-crm.order-details.status-changed', {
          status: this.getStatusTranslation(newStatus),
        })
      );
    }
  }

  saveOrder(): void {
    if (!this.order()) {
      this.toast.error(this.translate.instant('orders-crm.order-details.no-data'));
      return;
    }

    this.saving.set(true);

    setTimeout(() => {
      this.saving.set(false);
      this.toast.success(this.translate.instant('orders-crm.order-details.order-saved'));
    }, 1000);
  }

  goBack(): void {
    window.history.back();
  }

  printOrder(): void {
    window.print();
  }

  downloadInvoice(): void {
    if (!this.order()) {
      this.toast.error(this.translate.instant('orders-crm.order-details.no-data'));
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);

      const invoiceContent = this.generateInvoiceContent();
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${this.order()?.id?.slice(0, 8)}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);

      this.toast.success(this.translate.instant('orders-crm.order-details.invoice-downloaded'));
    }, 1500);
  }

  private generateInvoiceContent(): string {
    const order = this.order();
    if (!order) return '';

    return `
${this.translate.instant('orders-crm.order-details.invoice')}
${this.translate.instant('orders-crm.order-details.order-id')}: ${order.id?.slice(0, 8) || 'N/A'}
${this.translate.instant('orders-crm.order-details.date')}: ${new Date().toLocaleDateString()}
${this.translate.instant('orders-crm.order-details.status')}: ${this.getStatusTranslation(
      order.status
    )}
${this.translate.instant(
  'orders-crm.order-details.payment-status'
)}: ${this.getPaymentStatusTranslation(order.paymentStatus)}

${this.translate.instant('orders-crm.order-details.customer-info')}
${this.translate.instant('orders-crm.order-details.name')}: ${order.customerName}
${this.translate.instant('orders-crm.order-details.email')}: ${order.customerEmail}
${this.translate.instant('orders-crm.order-details.phone')}: ${order.customerPhone}
${
  order.buyerName
    ? `${this.translate.instant('orders-crm.order-details.buyer-name')}: ${order.buyerName}`
    : ''
}

${this.translate.instant('orders-crm.order-details.shipping-info')}
${this.translate.instant('orders-crm.order-details.address')}: ${order.address}
${this.translate.instant('orders-crm.order-details.state')}: ${order.state}
${this.translate.instant('orders-crm.order-details.country')}: ${order.country}
${this.translate.instant('orders-crm.order-details.zip-code')}: ${order.zipCode}

${this.translate.instant('orders-crm.order-details.order-items')}
${order.orderItems
  .map((item) => `${item.name} - $${item.price} x ${item.quantity} = $${item.total}`)
  .join('\n')}

${this.translate.instant('orders-crm.order-details.totals')}
${this.translate.instant('orders-crm.order-details.items')}: ${this.itemsTotalQuantity()}
${this.translate.instant('orders-crm.order-details.amount')}: $${this.itemsTotalPrice()}

${this.translate.instant(
  'orders-crm.order-details.payment-method'
)}: ${this.getPaymentMethodTranslation(order.paymentMethod)}
${this.translate.instant('orders-crm.order-details.amount')}: $${order.amount}
    `.trim();
  }
}
