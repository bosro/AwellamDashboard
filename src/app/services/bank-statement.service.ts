// services/bank-statement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface BankTransaction {
  _id: string;
  bank: any;
  amount: number;
  reference: string;
  date: Date;
  matched: boolean;
  matchedToCustomerId: any;
  uploadId: string;
  orderType?:{
    name:string
  }
}

export interface BankUpload {
  _id: string;
  bank: string;
  fileName: string;
  createdAt: Date;
  count?: number;
}

export interface TransactionsResponse {
  success: boolean;
  data: BankTransaction[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BankStatementService {
  private apiUrl = `${environment.apiUrl}/bank-statement`;

  constructor(private http: HttpClient) { }

  uploadBankStatement(bankId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload/${bankId}`, formData);
  }

  getAllTransactions(page: number = 1, limit: number = 50): Observable<TransactionsResponse> {
    return this.http.get<TransactionsResponse>(`${this.apiUrl}/transactions/all?page=${page}&limit=${limit}`);
  }

  getTransactionsByUploadId(uploadId: string): Observable<TransactionsResponse> {
    return this.http.get<TransactionsResponse>(`${this.apiUrl}/transactions/upload/${uploadId}`);
  }

  getUploadsByBankId(bankId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/uploads/bank/${bankId}`);
  }

  getUploadsByBank(bankId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions/${bankId}`);
  }

  reconcileTransaction(transactionId: string, customerId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reconcile`, { transactionId, customerId });
  }

  reconcileTransactionWithOrderType(transactionId: string, orderTypeId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reconcile/order-type`, { transactionId, orderTypeId });
  }

 

  getTransaction(transactionId: string): Observable<BankTransaction> {
    return this.http.get<BankTransaction>(`${this.apiUrl}/transaction/${transactionId}`);
  }

  deleteTransaction(transactionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/entry/${transactionId}`);
  }

  deleteUploadById(uploadId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/uploads/${uploadId}`);
  }

  filterUploads( filters: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    
    if (filters.reference) {
      params = params.set('reference', filters.reference);
    }
    
    if (filters.amount !== null) {
      params = params.set('amount', filters.amount.toString());
    }
    
    return this.http.get(`${this.apiUrl}/uploads/filter`, { params });
  }
}