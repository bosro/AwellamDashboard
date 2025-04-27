import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, } from '../shared/types/customer.interface';
import { environment } from '../environments/environment';
import { Order } from './order.service';

export interface OrderResponse {
  message: string;
  orders: Order[];
}
export interface TransactionResponse {
  message: string;
  data: any[];
}



@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = `${environment.apiUrl}/customers`;
  private apiUrll = `${environment.apiUrl}/transactions`;
  private apiUrlll = `${environment.apiUrl}/selflist`;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<{ customers: Customer[]; total: number }> {
    return this.http.get<{ customers: Customer[]; total: number }>(`${this.apiUrl}/get`);
    }
    


    sendBulkSms(message: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/bulk-sms`, { message });
    }
  


  getCustomerById(id: string): Observable<{ customer: Customer }> {
    return this.http.get<{ customer: Customer }>(`${this.apiUrl}/get/${id}`);
  }
  getSelfLiftOrder(id: string): Observable< any > {
    return this.http.get< any >(`${this.apiUrlll}/orders/${id}`);
  }


  getCustomerTransactions(id: string, params?: any): Observable<TransactionResponse> {
    return this.http.get<TransactionResponse>(`${this.apiUrll}/get/${id}/transactions`, { params });
  }

  
  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/create`, customer);
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/update/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  getCustomerOrders(id: string, params?: any): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}/orders`, { params });
  }


  applySegments(ids: string[], segmentIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk/segments`, { ids, segmentIds });
  }

  // Analytics
  getCustomerAnalytics(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`, { params });
  }

  exportCustomers(format: 'csv' | 'excel', filters?: any): Observable<Blob> {
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





  // Communication
  sendCustomerEmail(id: string, emailData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/communications/email`, emailData);
  }

  getCommunicationHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/communications`);
  }
}