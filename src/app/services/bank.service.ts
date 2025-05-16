// services/bank.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Bank {
  _id: string;
  name: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private apiUrl = `${environment.apiUrl}/banks`;
  private statementApiUrl = `${environment.apiUrl}/bank-statement`;

  constructor(private http: HttpClient) { }

  getAllBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(`${this.apiUrl}/get/all`);
  }

  getBankById(id: string): Observable<Bank> {
    return this.http.get<Bank>(`${this.apiUrl}/get/${id}`);
  }

  createBank(name: string): Observable<Bank> {
    return this.http.post<Bank>(`${this.apiUrl}/new`, { name });
  }

  updateBank(id: string, name: string): Observable<Bank> {
    return this.http.put<Bank>(`${this.apiUrl}/edit/${id}`, { name });
  }

  deleteBank(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }

  // Additional methods needed for BankDetailComponent
  
  // Method to get a single bank (aliased to getBankById for compatibility)
  getBank(id: string): Observable<Bank> {
    return this.getBankById(id);
  }

  // Get all transactions
  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.statementApiUrl}/transactions/all`);
  }

  // Upload CSV/Excel file with progress tracking
  uploadCSV(bankId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.statementApiUrl}/upload/${bankId}`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * (event.loaded / (event.total || 1)));
            return { status: 'progress', progress };
          case HttpEventType.Response:
            return { status: 'complete', data: event.body };
          default:
            return { status: 'unknown' };
        }
      })
    );
  }

  // Reconcile a transaction to a customer
  reconcile(transactionId: string, customerId: string): Observable<any> {
    return this.http.post<any>(`${this.statementApiUrl}/reconcile`, {
      transactionId,
      customerId
    });
  }

  // Get transactions for a specific bank
  getBankTransactions(bankId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.statementApiUrl}/transactions?bankId=${bankId}`);
  }
  
  // Get uploads for a specific bank
  getUploadsByBankId(bankId: string): Observable<any> {
    return this.http.get<any>(`${this.statementApiUrl}/uploads/bank/${bankId}`);
  }

  // Get transactions for a specific upload
  getTransactionsByUploadId(uploadId: string): Observable<any> {
    return this.http.get<any>(`${this.statementApiUrl}/transactions/upload/${uploadId}`);
  }
}