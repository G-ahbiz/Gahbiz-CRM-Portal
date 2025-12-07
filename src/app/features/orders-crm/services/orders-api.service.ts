import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { OrderListItem } from '../interfaces/order-list-item';
import { OrderDetails } from '../interfaces/order-details';
import { StatisticsResponse } from '../interfaces/statistics-response';

@Injectable({
  providedIn: 'root',
})
export class OrdersApiService {
  apiUrl = `${environment.baseApi}`;

  constructor(private http: HttpClient) {}

  getAllOrders(params: HttpParams) {
    const url = `${this.apiUrl}${environment.crmOrder.getAllOrders}`;
    return this.http.get<ApiResponse<PagenatedResponse<OrderListItem>>>(url, {
      params,
    });
  }

  getOrderById(id: string) {
    const url = `${this.apiUrl}${environment.crmOrder.getOrder(id)}`;
    return this.http.get<ApiResponse<OrderDetails>>(url);
  }

  getOrderStatistics() {
    const url = `${this.apiUrl}${environment.statistics.getOrderStatistics}`;
    return this.http.get<ApiResponse<StatisticsResponse>>(url);
  }
}
