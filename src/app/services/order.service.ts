import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Order {
  _id: string;
  customerId: {
    _id: string;
    fullName: string;
    phoneNumber: number;
  };
  orderItems: {
    product: {
      _id: string;
      name: string;
    };
    quantity: number;
    price: number; // Changed to number
    _id: string;
  }[];
  deliveryAddress: string;
  totalAmount: number; // Changed to number
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  orderNumber: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}


export interface OrderResponse {
  message: string;
  orders: Order[];
}

interface OrdersResponse {
  message: string;
  order: {
    _id: string;
    status: string;
    customerId: {
      _id: string;
      fullName: string;
      phoneNumber: number;
    };
    deliveryAddress: string;
    orderItems: {
      product: {
        _id: string;
        name: string;
      };
      quantity: number;
      price: number;
      _id: string;
    }[];
    totalAmount: number;
    paymentStatus: string;
    deliveryStatus: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    orderNumber: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  getOrders(): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/get`);
  }

  getOrderById(id: string): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.apiUrl}/get/${id}`);
  }

  toggleOrderStatus(id: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  editOrder(id: string, data: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/edit/${id}`, data);
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/orders/${id}`);
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/create`, orderData);
  }
}