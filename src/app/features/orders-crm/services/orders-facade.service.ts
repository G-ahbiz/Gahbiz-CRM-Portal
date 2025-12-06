import { Injectable, signal, computed } from '@angular/core';
import { OrdersApiService } from './orders-api.service';
import { CRMOrderRequestParams, OrderItem } from '../interfaces/order';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { ApiResponse } from '@core/interfaces/api-response';
import { Observable, catchError, map, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ToastService } from '@core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class OrdersFacadeService {
  private _orders = signal<PagenatedResponse<OrderItem> | null>(null);
  readonly orders = computed(() => this._orders());

  constructor(private ordersApiService: OrdersApiService, private toastService: ToastService) {}

  /**
   * Call API and return paginated data as Observable.
   * Also updates internal signal state.
   */
  getAllOrders(params: CRMOrderRequestParams = {}): Observable<PagenatedResponse<OrderItem>> {
    const httpParams = this.normalizeParams(params);

    return this.ordersApiService.getAllOrders(httpParams).pipe(
      map((res: ApiResponse<PagenatedResponse<OrderItem>>) => {
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
}
