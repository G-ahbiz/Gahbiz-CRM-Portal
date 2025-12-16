import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { OrderDetails } from '../../interfaces/order-details';
import { OrdersFacadeService } from '@features/orders-crm/services/orders-facade.service';
import { ToastService } from '@core/services/toast.service';
import { UpdateStatusRequest } from '@features/orders-crm/interfaces/update-status-request';
import { OrderStatus } from '@features/orders-crm/type/order-status.enum';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './order-details.html',
  styleUrls: ['./order-details.css'],
})
export class OrderDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderFacade = inject(OrdersFacadeService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  // State signals
  order = signal<OrderDetails | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  updatingStatus = signal<boolean>(false);
  savingNote = signal<boolean>(false);
  currentNote = signal<string>('');
  selectedItems = signal<string[]>([]);
  allItemsSelected = signal<boolean>(false);
  showStatusConfirmation = signal<boolean>(false);
  pendingStatusChange = signal<OrderStatus | null>(null);

  // Make this public for template access
  noteChanged = signal<boolean>(false);

  // Auto-save note
  private noteSaveSubject = new Subject<string>();

  // Status options with their properties
  statusOptions = signal<
    Array<{
      value: OrderStatus;
      label: string;
      icon: string;
      color: string;
      requiresConfirmation: boolean;
      confirmationMessage: string;
    }>
  >([
    {
      value: 'Created',
      label: 'ORDERS.order-details.created',
      icon: 'pi pi-plus-circle',
      color: 'bg-gray-100 text-gray-800',
      requiresConfirmation: false,
      confirmationMessage: '',
    },
    {
      value: 'Paid',
      label: 'ORDERS.order-details.paid',
      icon: 'pi pi-check-circle',
      color: 'bg-green-100 text-green-800',
      requiresConfirmation: true,
      confirmationMessage: 'ORDERS.order-details.confirm-paid',
    },
    {
      value: 'Pending',
      label: 'ORDERS.order-details.pending',
      icon: 'pi pi-clock',
      color: 'bg-yellow-100 text-yellow-800',
      requiresConfirmation: false,
      confirmationMessage: '',
    },
    {
      value: 'Processing',
      label: 'ORDERS.order-details.processing',
      icon: 'pi pi-cog',
      color: 'bg-blue-100 text-blue-800',
      requiresConfirmation: false,
      confirmationMessage: '',
    },
    {
      value: 'Completed',
      label: 'ORDERS.order-details.completed',
      icon: 'pi pi-check',
      color: 'bg-green-100 text-green-800',
      requiresConfirmation: true,
      confirmationMessage: 'ORDERS.order-details.confirm-completed',
    },
    {
      value: 'Cancelled',
      label: 'ORDERS.order-details.cancelled',
      icon: 'pi pi-times-circle',
      color: 'bg-red-100 text-red-800',
      requiresConfirmation: true,
      confirmationMessage: 'ORDERS.order-details.confirm-cancelled',
    },
    {
      value: 'Refunded',
      label: 'ORDERS.order-details.refunded',
      icon: 'pi pi-dollar',
      color: 'bg-purple-100 text-purple-800',
      requiresConfirmation: true,
      confirmationMessage: 'ORDERS.order-details.confirm-refunded',
    },
  ]);

  // Computed values
  itemsTotalQuantity = computed(() => {
    const items = this.order()?.orderItems || [];
    return items.reduce((total, item) => total + item.quantity, 0);
  });

  itemsTotalPrice = computed(() => {
    const items = this.order()?.orderItems || [];
    return items.reduce((total, item) => total + item.total, 0);
  });

  canEditOrder = computed(() => {
    const status = this.order()?.status;
    const nonEditableStatuses: OrderStatus[] = ['Cancelled', 'Refunded', 'Completed'];
    return !nonEditableStatuses.includes(status as OrderStatus);
  });

  // Initialize auto-save for notes
  constructor() {
    // Auto-save note with debounce
    this.noteSaveSubject
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.savingNote.set(true)),
        switchMap((note) =>
          this.saveNoteInternal(note).pipe(finalize(() => this.savingNote.set(false)))
        )
      )
      .subscribe({
        error: (err) => {
          console.error('Auto-save note error', err);
          this.toast.error(this.translate.instant('ORDERS.order-details.note-save-error'));
        },
      });
  }

  private toOrderStatus(status: string): OrderStatus {
    const validStatuses: OrderStatus[] = [
      'Created',
      'Paid',
      'Pending',
      'Processing',
      'Completed',
      'Cancelled',
      'Refunded',
    ];

    return validStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : 'Created';
  }

  // Fix: Make this method accept string and return the status option
  getStatusOption(status: string | OrderStatus | null | undefined) {
    if (!status) return null;
    const statusEnum = this.toOrderStatus(status);
    return this.statusOptions().find((opt) => opt.value === statusEnum);
  }

  // Fix: Accept string parameter instead of OrderStatus
  getStatusClass(status: string | OrderStatus | null | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';

    const statusLower = status.toString().toLowerCase();
    switch (statusLower) {
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
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'created':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusTranslation(status: string | null | undefined): string {
    if (!status) return '';

    const statusMap: Record<string, string> = {
      created: 'ORDERS.order-details.created',
      pending: 'ORDERS.order-details.pending',
      processing: 'ORDERS.order-details.processing',
      completed: 'ORDERS.order-details.completed',
      cancelled: 'ORDERS.order-details.cancelled',
      paid: 'ORDERS.order-details.paid',
      refunded: 'ORDERS.order-details.refunded',
      unpaid: 'ORDERS.order-details.unpaid',
      failed: 'ORDERS.order-details.failed',
    };

    const key = statusMap[status.toLowerCase()] || status;
    return this.translate.instant(key);
  }

  getPaymentStatusClass(status: string | null | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
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

  getPaymentStatusTranslation(status: string | null | undefined): string {
    if (!status) return '';

    const statusMap: Record<string, string> = {
      paid: 'ORDERS.order-details.paid',
      pending: 'ORDERS.order-details.pending',
      failed: 'ORDERS.order-details.failed',
    };
    return this.translate.instant(statusMap[status.toLowerCase()] || status);
  }

  getPaymentMethodTranslation(method: string | null | undefined): string {
    if (!method) return '';

    const methodMap: Record<string, string> = {
      creditcard: 'ORDERS.order-details.credit-card',
      debitcard: 'ORDERS.order-details.debit-card',
      paypal: 'ORDERS.order-details.paypal',
      banktransfer: 'ORDERS.order-details.bank-transfer',
      cash: 'ORDERS.order-details.cash',
    };
    return this.translate.instant(methodMap[method.toLowerCase()] || method);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allItemsSelected.set(checked);
    const items = this.order()?.orderItems || [];
    this.selectedItems.set(checked ? items.map((item) => item.id) : []);
  }

  isItemSelected(itemId: string): boolean {
    return this.selectedItems().includes(itemId);
  }

  toggleItemSelection(itemId: string): void {
    const items = this.selectedItems();
    this.selectedItems.set(
      items.includes(itemId) ? items.filter((id) => id !== itemId) : [...items, itemId]
    );
  }

  updateQuantity(itemId: string, change: number): void {
    if (!this.order()?.orderItems || !this.canEditOrder()) return;

    const updatedItems = this.order()!.orderItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: Math.max(1, item.quantity + change),
            total: item.price * Math.max(1, item.quantity + change),
          }
        : item
    );

    this.order.update((order) =>
      order
        ? {
            ...order,
            orderItems: updatedItems,
            amount: updatedItems.reduce((sum, item) => sum + item.total, 0),
          }
        : order
    );

    this.toast.success(this.translate.instant('ORDERS.order-details.quantity-updated'));
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
            this.error.set(this.translate.instant('ORDERS.order-details.order-not-found'));
          }
        },
        error: (err) => {
          console.error('Error loading order details', err);
          this.error.set(this.translate.instant('ORDERS.order-details.load-error'));
          this.toast.error(this.translate.instant('ORDERS.order-details.load-error'));
        },
      });
  }

  private loadNote(orderId: string): void {
    const savedNote = localStorage.getItem(`order-note-${orderId}`);
    if (savedNote) {
      this.currentNote.set(savedNote);
      this.noteChanged.set(false);
    }
  }

  onNoteChange(note: string): void {
    this.currentNote.set(note);
    this.noteChanged.set(true);
    // Trigger auto-save
    this.noteSaveSubject.next(note);
  }

  saveNoteManual(): void {
    if (!this.order() || !this.currentNote().trim()) return;

    this.savingNote.set(true);
    this.saveNoteInternal(this.currentNote())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.savingNote.set(false))
      )
      .subscribe({
        next: () => {
          // Success handled in saveNoteInternal via tap
        },
        error: (err) => {
          console.error('Error saving note manually', err);
          this.toast.error(this.translate.instant('ORDERS.order-details.note-save-error'));
        },
      });
  }

  saveNoteToServer(): void {
    this.saveNoteManual();
  }

  private saveNoteInternal(note: string): Observable<string> {
    if (!this.order()) return of('');

    const orderId = this.order()!.id;
    const currentStatus = this.toOrderStatus(this.order()!.status);

    const statusRequest: UpdateStatusRequest = {
      status: currentStatus,
      note: note.trim(),
    };

    // Save to localStorage first for immediate feedback
    localStorage.setItem(`order-note-${orderId}`, note.trim());

    return this.orderFacade.updateOrderStatus(orderId, statusRequest).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => {
        this.noteChanged.set(false);
        this.toast.success(this.translate.instant('ORDERS.order-details.note-saved-server'));
      })
    );
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = this.toOrderStatus(target.value);
    const currentStatus = this.toOrderStatus(this.order()?.status || 'Created');

    if (newStatus === currentStatus) return;

    const option = this.getStatusOption(newStatus);

    if (option?.requiresConfirmation) {
      this.pendingStatusChange.set(newStatus);
      this.showStatusConfirmation.set(true);
      return;
    }

    this.updateStatus(newStatus);
  }

  updateStatus(newStatus: OrderStatus): void {
    if (!this.order()) return;

    this.updatingStatus.set(true);
    const orderId = this.order()!.id;
    const note = this.currentNote().trim();

    const statusRequest: UpdateStatusRequest = {
      status: newStatus,
      note: note,
    };

    this.orderFacade
      .updateOrderStatus(orderId, statusRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.updatingStatus.set(false))
      )
      .subscribe({
        next: () => {
          this.order.update((order) => (order ? { ...order, status: newStatus } : order));
          this.showStatusConfirmation.set(false);
          this.pendingStatusChange.set(null);

          this.toast.success(
            this.translate.instant('ORDERS.order-details.status-updated', {
              status: this.getStatusTranslation(newStatus),
            })
          );
        },
        error: (err) => {
          console.error('Error updating order status', err);
          this.toast.error(this.translate.instant('ORDERS.order-details.status-update-error'));
          // Reset the select dropdown to current status
          this.order.update((order) => order);
        },
      });
  }

  confirmStatusChange(): void {
    const status = this.pendingStatusChange();
    if (status) {
      this.updateStatus(status);
    }
  }

  cancelStatusChange(): void {
    this.showStatusConfirmation.set(false);
    this.pendingStatusChange.set(null);
  }

  saveOrder(): void {
    if (!this.order() || !this.canEditOrder()) {
      this.toast.error(this.translate.instant('ORDERS.order-details.cannot-edit-order'));
      return;
    }

    this.saving.set(true);
    // TODO: Implement actual save functionality
    setTimeout(() => {
      this.saving.set(false);
      this.toast.success(this.translate.instant('ORDERS.order-details.order-saved'));
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/main/orders/orders-main'], { relativeTo: this.route });
  }

  printOrder(): void {
    window.print();
  }

  downloadInvoice(): void {
    if (!this.order()) {
      this.toast.error(this.translate.instant('ORDERS.order-details.no-data'));
      return;
    }

    this.loading.set(true);
    // TODO: Implement actual invoice download
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
      this.toast.success(this.translate.instant('ORDERS.order-details.invoice-downloaded'));
    }, 1500);
  }

  private generateInvoiceContent(): string {
    const order = this.order();
    if (!order) return '';

    return `
${this.translate.instant('ORDERS.order-details.invoice')}
${this.translate.instant('ORDERS.order-details.order-id')}: ${order.id?.slice(0, 8) || 'N/A'}
${this.translate.instant('ORDERS.order-details.date')}: ${new Date().toLocaleDateString()}
${this.translate.instant('ORDERS.order-details.status')}: ${this.getStatusTranslation(order.status)}
${this.translate.instant(
  'ORDERS.order-details.payment-status'
)}: ${this.getPaymentStatusTranslation(order.paymentStatus)}

${this.translate.instant('ORDERS.order-details.customer-info')}
${this.translate.instant('ORDERS.order-details.name')}: ${order.customerName}
${this.translate.instant('ORDERS.order-details.email')}: ${order.customerEmail}
${this.translate.instant('ORDERS.order-details.phone')}: ${order.customerPhone}
${
  order.buyerName
    ? `${this.translate.instant('ORDERS.order-details.buyer-name')}: ${order.buyerName}`
    : ''
}

${this.translate.instant('ORDERS.order-details.shipping-info')}
${this.translate.instant('ORDERS.order-details.address')}: ${order.address}
${this.translate.instant('ORDERS.order-details.state')}: ${order.state}
${this.translate.instant('ORDERS.order-details.country')}: ${order.country}
${this.translate.instant('ORDERS.order-details.zip-code')}: ${order.zipCode}

${this.translate.instant('ORDERS.order-details.order-items')}
${order.orderItems
  .map((item) => `${item.name} - $${item.price} x ${item.quantity} = $${item.total}`)
  .join('\n')}

${this.translate.instant('ORDERS.order-details.totals')}
${this.translate.instant('ORDERS.order-details.items')}: ${this.itemsTotalQuantity()}
${this.translate.instant('ORDERS.order-details.subtotal')}: $${this.itemsTotalPrice()}
${this.translate.instant('ORDERS.order-details.grand-total')}: $${this.itemsTotalPrice()}

${this.translate.instant(
  'ORDERS.order-details.payment-method'
)}: ${this.getPaymentMethodTranslation(order.paymentMethod)}
    `.trim();
  }
}
