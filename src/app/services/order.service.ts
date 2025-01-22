import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address, Order, OrderNote, OrderStatus, PaymentStatus } from '../shared/types/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(params?: any): Observable<{ data: Order[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<{ data: Order[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateShippingInfo(id: string, shippingInfo: any): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/shipping`, shippingInfo);
  }

  processRefund(id: string, refundData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/refund`, refundData);
  }

  addOrderNote(id: string, note: any): Observable<OrderNote> {
    return this.http.post<OrderNote>(`${this.apiUrl}/${id}/notes`, note);
  }

  bulkUpdateStatus(ids: string[], status: OrderStatus): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk/status`, { ids, status });
  }

  getOrderAnalytics(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`, { params });
  }

  exportOrders(format: 'csv' | 'excel', filters?: any): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.keys(filters).forEach(key => {
        params = params.set(key, filters[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  validateAddress(address: Address): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/validate-address`, address);
  }

  getShippingRates(orderData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/shipping-rates`, orderData);
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, orderData);
  }

 
}