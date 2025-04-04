// transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../../types';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
    private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  addTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions/create`, transaction);
  }

  getTransactions(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Add optional filters
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<{ data: Transaction[]; totalPages: number; totalOrders: number }>(`${this.apiUrl}/transactions/get`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`);
  }


  getDebtors():Observable<Blob> {
    return this.http.get(`${this.apiUrl}/transactions/debtors/export`,{
         responseType: 'blob'
    });
  }
  

  updateTransaction(id: string, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/edit/${id}`, transaction);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/delete/${id}`);
  }
}