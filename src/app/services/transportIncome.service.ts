// transport-income.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface TransportIncome {
  _id?: string;
  customer: string;
  truck: any;
  amount: number;
  createdBy?: any;
  receipts?: Receipt[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Receipt {
  amount: number;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: any;
  submittedAt: Date;
}

export interface CreateTransportIncomeRequest {
  customer: string;
  driver: string;
  amount: number;
}

export interface UploadReceiptRequest {
  amount: number;
  submittedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransportIncomeService {
  private apiUrl =`${environment.apiUrl}/transport-income`; // Adjust base URL as needed

  constructor(private http: HttpClient) {}

  // Create a new transport income
  createTransportIncome(data: CreateTransportIncomeRequest): Observable<TransportIncome> {
    return this.http.post<TransportIncome>(`${this.apiUrl}/add`, data);
  }

  // Get all transport incomes
  getAllTransportIncomes(): Observable<TransportIncome[]> {
    return this.http.get<TransportIncome[]>(`${this.apiUrl}/get/all`);
  }

  // Get single transport income by ID
  getTransportIncomeById(id: string): Observable<TransportIncome> {
    return this.http.get<TransportIncome>(`${this.apiUrl}/get/${id}`);
  }

  // Update transport income
  updateTransportIncome(id: string, data: Partial<TransportIncome>): Observable<TransportIncome> {
    return this.http.put<TransportIncome>(`${this.apiUrl}/edit/${id}`, data);
  }

  // Delete transport income
  deleteTransportIncome(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  // Update receipt amount - NEW METHOD
  updateReceiptAmount(id: string, amount: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, { amount });
  }

  // Delete receipt entry - NEW METHOD
  deleteReceiptEntry(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/receipt/${id}`);
  }

  // View receipt file - NEW METHOD
  viewReceiptFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipts/view/${filename}`, { 
      responseType: 'blob' 
    });
  }

  // Upload receipt
  uploadReceipt(transportIncomeId: string, file: File, amount: number, submittedBy?: string): Observable<any> {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('amount', amount.toString());
    if (submittedBy) {
      formData.append('submittedBy', submittedBy);
    }

    return this.http.post(`${this.apiUrl}/${transportIncomeId}/receipts`, formData);
  }

  // Get all receipts
  getAllReceipts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/receipts`);
  }

  // Update receipt status
  updateReceiptStatus(transportIncomeId: string, receiptIndex: number, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${transportIncomeId}/receipts/${receiptIndex}`, { status });
  }
}