import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Receipt {
  _id: string;
  customerId: any;
  imageUrl: string;
  status: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = `${environment.apiUrl}/receipts`;

  constructor(private http: HttpClient) {}

  uploadReceipt(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, formData);
  }

  editReceipt(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/edit/${id}`, data);
  }

  deleteReceipt(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  getAllReceipts(): Observable<{ receipts: Receipt[] }> {
    return this.http.get<{ receipts: Receipt[] }>(`${this.apiUrl}/get/all`);
  }

  getReceiptsByCustomer(customerId: string): Observable<{ receipts: Receipt[] }> {
    return this.http.get<{ receipts: Receipt[] }>(`${this.apiUrl}/customer/${customerId}`);
  }
}
