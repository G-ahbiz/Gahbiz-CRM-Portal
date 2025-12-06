import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CRMOrderRequestParams, OrderItem } from '../interfaces/order';
import { ApiResponse } from '@core/interfaces/api-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';

@Injectable({
  providedIn: 'root',
})
export class OrdersApiService {
  apiUrl = `${environment.baseApi}`;

  constructor(private http: HttpClient) {}

  getAllOrders(params: HttpParams) {
    const url = `${this.apiUrl}${environment.crmOrder.getAllOrders}`;
    return this.http.get<ApiResponse<PagenatedResponse<OrderItem>>>(url, {
      params,
    });
  }
}
