import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Order {
  totalPrice: any;
items: any;
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
  assignedDriver:{
    _id: string,
    name: string

  };
  socNumber:{
    toLowerCase(): unknown;
    _id: string,
    socNumber: string,
    destinationId:{
      _id: string,
      destination: string
    }
  };
  plantId:{
    _id:string,
    name:string
  };
  deliveryAddress: string;
  totalAmount: number; // Changed to number
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  orderNumber: string;
  date: string;
  actualDeliveryDate: string;
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
    socNumber: { _id: string; socNumber: string; };
    categoryId: { _id: string; name: string; plantId: { _id: string; name: string; }; };
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
  private readonly apiUrll = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  getOrders(): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/get`);
  }
  getPendingOrders(startDate?: string, endDate?: string): Observable<OrderResponse> {
    let url = `${this.apiUrl}/get/pending`;
    
    // Add query parameters if provided
    if (startDate || endDate) {
      const params = new HttpParams()
        .set('startDate', startDate || '')
        .set('endDate', endDate || '');
      
      return this.http.get<OrderResponse>(url, { params });
    }
    
    return this.http.get<OrderResponse>(url);
  }

  getDelieveredOrders(startDate?: string, endDate?: string): Observable<OrderResponse> {
    let url = `${this.apiUrl}/get/delivered`;
    
    // Add query parameters if provided
    if (startDate || endDate) {
      const params = new HttpParams()
        .set('startDate', startDate || '')
        .set('endDate', endDate || '');
      
      return this.http.get<OrderResponse>(url, { params });
    }
    
    return this.http.get<OrderResponse>(url);
  }

  getProductOrders(productId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/product/${productId}`);
  }

  getPlantOrders(plantId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/plant/${plantId}`);
  }







  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id}`);
  }

  toggleOrderStatus(id: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
  toggleOrderDeliveredStatus(id: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, {});
  }

  editOrder(id: string, data: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/edit/${id}`, data);
  }

  updateOrderPrice(id: string, data: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/update/${id}`, data);
  }


  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/orders/${id}`);
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/create`, orderData);
  }

  getOrderAnalytics(filters: any): Observable<any> {
    const params = {
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end,
      groupBy: filters.groupBy
    };
    return this.http.get<any>(`${this.apiUrll}/dashboard/order-dashboard`, { params });
  }
}