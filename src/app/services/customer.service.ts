import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, } from '../shared/types/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = 'http://0.0.0.0:3000/api/customers';

  constructor(private http: HttpClient) {}

  getCustomers(params?: any): Observable<{ customers: Customer[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<{ customers: Customer[]; total: number }>(`${this.apiUrl}/get`, { params: httpParams });
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/get/${id}`);
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

  getCustomerOrders(id: string, params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/orders`, { params });
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