import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { OrderListItem } from '../interfaces/order-list-item';
import { OrderDetails } from '../interfaces/order-details';
import { StatisticsResponse } from '../interfaces/statistics-response';
import { Observable } from 'rxjs';
import { CreateOrderRequest } from '../interfaces/create-order-request';
import { UpdateStatusRequest } from '../interfaces/update-status-request';
import { OrderDropdown } from '../interfaces/order-dropdown';

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

  createOrder(orderData: CreateOrderRequest): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}${environment.crmOrder.addOrder}`;
    return this.http.post<ApiResponse<string>>(url, orderData);
  }

  importOrders(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('ExcelFile', file, file.name);

    const url = `${this.apiUrl}${environment.crmOrder.importOrders}`;
    return this.http.post<ApiResponse<any>>(url, formData);
  }

  getOrderStatistics() {
    const url = `${this.apiUrl}${environment.statistics.getOrderStatistics}`;
    return this.http.get<ApiResponse<StatisticsResponse>>(url);
  }

  updateOrderStatus(id: string, statusRequest: UpdateStatusRequest) {
    const url = `${this.apiUrl}${environment.crmOrder.updateOrderStatus(id)}`;
    return this.http.patch<ApiResponse<string>>(url, statusRequest);
  }

  ordersDropdown(): Observable<ApiResponse<OrderDropdown[]>> {
    const url = `${this.apiUrl}${environment.crmOrder.ordersDropdown}`;
    return this.http.get<ApiResponse<OrderDropdown[]>>(url);
  }
}
