import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerNote, CustomerSegment, CustomerStatus } from '../shared/types/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = '/api/customers';

  constructor(private http: HttpClient) {}

  getCustomers(params?: any): Observable<{ data: Customer[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<{ data: Customer[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCustomerOrders(id: string, params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/orders`, { params });
  }

  addCustomerNote(id: string, note: Partial<CustomerNote>): Observable<CustomerNote> {
    return this.http.post<CustomerNote>(`${this.apiUrl}/${id}/notes`, note);
  }

  updateCustomerStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Customer Segments
  getSegments(): Observable<CustomerSegment[]> {
    return this.http.get<CustomerSegment[]>(`${this.apiUrl}/segments`);
  }

  createSegment(segment: Partial<CustomerSegment>): Observable<CustomerSegment> {
    return this.http.post<CustomerSegment>(`${this.apiUrl}/segments`, segment);
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