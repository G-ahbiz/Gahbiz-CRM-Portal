import { Injectable, signal, computed } from '@angular/core';
import { OrdersApiService } from './orders-api.service';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { ApiResponse } from '@core/interfaces/api-response';
import { Observable, catchError, map, throwError, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ToastService } from '@core/services/toast.service';
import { CRMOrderRequestParams } from '../interfaces/CRM-order-request-params';
import { OrderListItem } from '../interfaces/order-list-item';
import { StatisticsResponse } from '../interfaces/statistics-response';
import { CreateOrderRequest } from '../interfaces/create-order-request';
import { UpdateStatusRequest } from '../interfaces/update-status-request';

@Injectable({
  providedIn: 'root',
})
export class OrdersFacadeService {
  private _orders = signal<PagenatedResponse<OrderListItem> | null>(null);
  readonly orders = computed(() => this._orders());

  // Track loading state
  private _isCreatingOrder = signal(false);
  readonly isCreatingOrder = computed(() => this._isCreatingOrder());

  constructor(private ordersApiService: OrdersApiService, private toastService: ToastService) {}

  /**
   * Call API and return paginated data as Observable.
   * Also updates internal signal state.
   */
  getAllOrders(params: CRMOrderRequestParams = {}): Observable<PagenatedResponse<OrderListItem>> {
    const httpParams = this.normalizeParams(params);

    return this.ordersApiService.getAllOrders(httpParams).pipe(
      map((res: ApiResponse<PagenatedResponse<OrderListItem>>) => {
        if (!res?.succeeded) {
          throw new Error(res?.message ?? 'Failed to load orders');
        }
        this._orders.set(res.data);
        return res.data;
      }),
      catchError((err) => {
        console.error('OrdersFacadeService.getAllOrders error', err);
        this.toastService.error(err.message || 'Failed to load orders');
        return throwError(() => err);
      })
    );
  }

  getOrderById(id: string) {
    return this.ordersApiService.getOrderById(id);
  }

  /**
   * Create a new order with proper error handling and state management
   */
  createOrder(orderData: CreateOrderRequest): Observable<string> {
    this._isCreatingOrder.set(true);

    return this.ordersApiService.createOrder(orderData).pipe(
      map((res: ApiResponse<string>) => {
        if (!res?.succeeded) {
          throw new Error(res?.message ?? 'Failed to create order');
        }
        this.toastService.success('Order created successfully!');
        return res.data; // Returns the order ID
      }),
      catchError((err) => {
        console.error('OrdersFacadeService.createOrder error', err);
        const errorMessage = this.getErrorMessage(err);
        this.toastService.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      tap({
        next: (orderId) => {
          console.log('Order created with ID:', orderId);
          this._isCreatingOrder.set(false);
        },
        error: () => this._isCreatingOrder.set(false),
        finalize: () => this._isCreatingOrder.set(false),
      })
    );
  }

  importOrder(file: File) {
    return this.ordersApiService.importOrders(file);
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Invalid data. Please check your information.';
    } else if (error.status === 401) {
      return 'Session expired. Please login again.';
    } else if (error.status === 403) {
      return 'You do not have permission to create orders.';
    } else if (error.status === 409) {
      return 'A similar order already exists.';
    } else if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return error.message || 'Failed to create order. Please try again.';
  }

  /**
   * Normalize params so HttpClient receives strings and no undefined values.
   */
  private normalizeParams(params: CRMOrderRequestParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.pageNumber != null) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }

    if (params.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    if (params.lastDays != null) {
      httpParams = httpParams.set('lastDays', params.lastDays.toString());
    }

    if (params.searchTerm != null && params.searchTerm !== '') {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return httpParams;
  }

  getStatistics() {
    return this.ordersApiService.getOrderStatistics().pipe(
      map((res: ApiResponse<StatisticsResponse>) => res.data),
      catchError((err) => {
        console.error('OrdersFacadeService.getStatistics error', err);
        this.toastService.error(err.message || 'Failed to load statistics');
        return throwError(() => err);
      })
    );
  }

  updateOrderStatus(id: string, statusRequest: UpdateStatusRequest) {
    return this.ordersApiService.updateOrderStatus(id, statusRequest).pipe(
      map((res: ApiResponse<string>) => res.data),
      catchError((err) => {
        console.error('OrdersFacadeService.updateOrderStatus error', err);
        this.toastService.error(err.message || 'Failed to update order status');
        return throwError(() => err);
      })
    );
  }
}
