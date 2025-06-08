import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderTypeService {
  private apiUrl = `${environment.apiUrl}/order-types`;
  private apiUrll = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  // Create a new OrderType
  createOrderType(data: { name: string; amount: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/new`, data);
  }

  // Get all OrderTypes
  getAllOrderTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/all`);
  }

  // Get a single OrderType by ID
  getOrderTypeById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/${id}`);
  }

  // Update an OrderType
  updateOrderType(id: string, data: { name: string; amount: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/edit/${id}`, data);
  }

   // Fetch payment references by orderTypeId
   getPaymentReferences(orderTypeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrll}/payment-references/${orderTypeId}/get`);
  }

  // Delete an OrderType
  deleteOrderType(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}