import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus, PaymentStatus } from '../shared/types/order.interface';

// Define interfaces for better type safety
interface OrderResponse {
  orders: Order[];
  total: number;
}

interface ShippingInfo {
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: Date;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface RefundData {
  amount: number;
  reason: string;
  refundMethod: string;
}

interface ShippingRate {
  carrier: string;
  rate: number;
  estimatedDays: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly apiUrl = 'http://0.0.0.0:3000/api/orders';

  constructor(private readonly http: HttpClient) {}

  getOrders(params?: Record<string, any>): Observable<OrderResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, value);
      });
    }
    return this.http.get<OrderResponse>(`${this.apiUrl}/get`, { params: httpParams });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateShippingInfo(id: string, shippingInfo: ShippingInfo): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/shipping`, shippingInfo);
  }

  processRefund(id: string, refundData: RefundData): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/refund`, refundData);
  }

  bulkUpdateStatus(ids: string[], status: OrderStatus): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk/status`, { ids, status });
  }

  getOrderAnalytics(params?: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`, { params });
  }

  exportOrders(format: 'csv' | 'excel', filters?: Record<string, any>): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params = params.set(key, value);
      });
    }
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  getShippingRates(orderData: Partial<Order>): Observable<ShippingRate[]> {
    return this.http.post<ShippingRate[]>(`${this.apiUrl}/shipping-rates`, orderData);
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/create`, orderData);
  }
}