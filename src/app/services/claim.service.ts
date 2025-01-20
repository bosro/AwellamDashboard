import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Claim {
  id: number;
  claimNumber: string;
  date: string;
  customerName: string;
  salesOrderNumber: string;
  invoiceNumber: string;
  productType: string;
  quantity: number;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  description: string;
  attachments?: string[];
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentDate?: string;
  notes?: string;
  processingDate?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  private apiUrl = `${environment.apiUrl}/claims`;

  constructor(private http: HttpClient) {}

  // Claims CRUD Operations
  getClaims(params?: any): Observable<{ data: Claim[], total: number }> {
    return this.http.get<{ data: Claim[], total: number }>(
      `${this.apiUrl}`, 
      { params }
    );
  }



  createClaim(claim: Omit<Claim, 'id'>): Observable<Claim> {
    return this.http.post<Claim>(`${this.apiUrl}`, claim);
  }

 
  // deleteClaim(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }

  

  // VAT Calculations
  calculateVAT(amount: number): Observable<{ vatAmount: number, totalAmount: number }> {
    return this.http.post<{ vatAmount: number, totalAmount: number }>(
      `${this.apiUrl}/calculate-vat`,
      { amount }
    );
  }


  // Batch Operations
  // batchProcessClaims(claimIds: number[], action: string): Observable<void> {
  //   return this.http.post<void>(`${this.apiUrl}/batch-process`, {
  //     claimIds,
  //     action
  //   });
  // }

  // File Upload
  uploadAttachments(claimId: number, files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<string[]>(
      `${this.apiUrl}/${claimId}/attachments`,
      formData
    );
  }

  // Analytics
  getClaimsAnalytics(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`, { params });
  }



  // getClaims(params: ClaimsFilter): Observable<ClaimsResponse> {
  //   return this.http.get<ClaimsResponse>(this.apiUrl, { params: params as any });
  // }

  batchProcessClaims(claimIds: number[], action: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batch-process`, { claimIds, action });
  }

  generateReport(claimId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${claimId}/report`, { responseType: 'blob' });
  }

  generateBatchReport(claimIds: number[]): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/batch-report`, { claimIds }, { responseType: 'blob' });
  }

  deleteClaim(claimId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${claimId}`);
  }


  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  updateClaim(id: number, updates: Partial<Claim>): Observable<Claim> {
    return this.http.patch<Claim>(`${this.apiUrl}/${id}`, updates);
  }

  generateClaimReport(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/report`, { responseType: 'blob' });
  }
  
}