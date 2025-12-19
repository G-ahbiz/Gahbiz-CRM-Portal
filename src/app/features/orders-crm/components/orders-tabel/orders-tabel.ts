import {
  Component,
  ViewChild,
  ElementRef,
  DestroyRef,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { OrdersFacadeService } from '@features/orders-crm/services/orders-facade.service';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';

import { OrderListItem } from '@features/orders-crm/interfaces/order-list-item';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { User } from '@features/auth/interfaces/sign-in/user';
import { CRMOrderRequestParams } from '@features/orders-crm/interfaces/CRM-order-request-params';
import { ErrorFacadeService } from '@core/services/error.facade.service';

// ------------------------------
// Constants
// ------------------------------
const ALLOWED_SORT_FIELDS = ['createdDate', 'status', 'amount', 'address'] as const;

const LAST_DAYS_OPTIONS = [
  { label: 'All', value: 0 },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 60 days', value: 60 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 180 days', value: 180 },
  { label: 'Last 365 days', value: 365 },
] as const;

export const ordersTableHeader: readonly string[] = [
  'ID',
  'Customer',
  'Amount',
  'Status',
  'Date',
  'Address',
  'Actions',
];

@Component({
  selector: 'app-orders-tabel',
  templateUrl: './orders-tabel.html',
  styleUrls: ['./orders-tabel.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    RouterLink,
    TranslateModule,
  ],
})
export class OrdersTabel implements OnInit, OnDestroy {
  // ------------------------------
  // ViewChild
  // ------------------------------
  @ViewChild('dt') dt!: Table;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // ------------------------------
  // Signals
  // ------------------------------
  loading = signal(true);
  ordersData = signal<OrderListItem[]>([]);
  selectedOrders = signal<string[]>([]);
  searchValue = signal('');

  currentUser = signal<User | null>(null);

  // ------------------------------
  // Filters & Pagination
  // ------------------------------
  lastDaysOptions = LAST_DAYS_OPTIONS;
  selectedLastDays = 0;

  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;

  // ------------------------------
  // Search debouncer
  // ------------------------------
  private searchSubject = new Subject<string>();

  // ------------------------------
  // Injected Services
  // ------------------------------
  private readonly ordersFacade = inject(OrdersFacadeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorFacade = inject(ErrorFacadeService);

  ngOnInit(): void {
    this.listenToUser();
    this.setupSearchSubscription();
    this.loadOrders();
  }

  // ===========================================
  // INIT HANDLERS
  // ===========================================

  private listenToUser() {
    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.currentUser.set(user));
  }

  private setupSearchSubscription() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchValue.set(value);
        this.pageNumber = 1;
        this.loadOrders();
      });
  }

  // ===========================================
  // LOAD ORDERS
  // ===========================================

  loadOrders(): void {
    this.loading.set(true);

    const params: CRMOrderRequestParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      ...(this.selectedLastDays > 0 && { lastDays: this.selectedLastDays }),
      ...(this.searchValue() && { searchTerm: this.searchValue() }),
    };

    this.ordersFacade
      .getAllOrders(params)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: PagenatedResponse<OrderListItem>) => {
          this.ordersData.set(res.items ?? []);
          this.totalRecords = res.totalCount ?? 0;
          this.pageNumber = res.pageNumber ?? 1;

          // Reset selection
          this.selectedOrders.set([]);
        },
        error: (error) => {
          this.errorFacade.showError(error as Error);
        },
      });
  }

  // ===========================================
  // SEARCH & FILTERS
  // ===========================================

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onLastDaysChange(event: any): void {
    this.selectedLastDays = event.value;
    this.pageNumber = 1;
    this.loadOrders();
  }

  clearFilters(table: Table): void {
    this.searchValue.set('');
    this.selectedLastDays = 0;

    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }

    this.pageNumber = 1;
    table.clear();

    this.loadOrders();
  }

  // ===========================================
  // NAVIGATION
  // ===========================================

  viewOrder(id: string): void {
    this.router.navigate(['/main/orders/order-details', id]);
  }

  // ===========================================
  // PAGINATION
  // ===========================================

  onPageChange(event: any): void {
    this.pageNumber = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadOrders();
  }

  // ===========================================
  // SELECTION LOGIC
  // ===========================================

  toggleOrderSelection(order: OrderListItem): void {
    order.selected = !order.selected;

    const updated = order.selected
      ? [...this.selectedOrders(), order.id]
      : this.selectedOrders().filter((id) => id !== order.id);

    this.selectedOrders.set(updated);
  }

  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    const updated = this.ordersData().map((order) => ({
      ...order,
      selected: checked,
    }));

    this.ordersData.set(updated);
    this.selectedOrders.set(checked ? updated.map((o) => o.id) : []);
  }

  get isAllSelected(): boolean {
    const orders = this.ordersData();
    return orders.length > 0 && orders.every((o) => o.selected);
  }

  // ===========================================
  // SORTING
  // ===========================================

  onSortColumn(event: any): void {
    if (!ALLOWED_SORT_FIELDS.includes(event.field)) return;

    this.sortClientSide(event.field, event.order);
  }

  private sortClientSide(field: string, order: number): void {
    const sorted = [...this.ordersData()].sort((a, b) => {
      let v1 = a[field as keyof OrderListItem];
      let v2 = b[field as keyof OrderListItem];

      if (field === 'createdDate') {
        v1 = new Date(v1 as string).getTime();
        v2 = new Date(v2 as string).getTime();
      }

      return order === 1 ? (v1 < v2 ? -1 : 1) : v1 > v2 ? -1 : 1;
    });

    this.ordersData.set(sorted);
  }

  // ===========================================
  // EXPORT (placeholder)
  // ===========================================

  exportOrders(): void {
    if (this.selectedOrders().length === 0) {
      this.toast.error('Please select at least one order');
      return;
    }
    this.toast.warning('Export functionality not implemented yet');
  }

  // ===========================================
  // STYLING HELPERS
  // ===========================================

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'text-warning',
      Completed: 'text-success',
      Cancelled: 'text-danger',
      Processing: 'text-info',
      Shipped: 'text-primary',
    };
    return map[status] ?? 'text-secondary';
  }

  getStatusBgClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning-subtle',
      Completed: 'bg-success-subtle',
      Cancelled: 'bg-danger-subtle',
      Processing: 'bg-info-subtle',
      Shipped: 'bg-primary-subtle',
    };
    return map[status] ?? 'bg-secondary-subtle';
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}
