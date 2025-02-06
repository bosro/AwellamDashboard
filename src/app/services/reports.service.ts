import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSalesReport(startDate: string, endDate: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/sales-report`,
      { startDate, endDate },
      { responseType: 'blob' }
    );
  }

  getPurchasingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/purchasing-report`, // Reuse the same endpoint
      { startDate, endDate },
      { responseType: 'blob' }
    );
  }

  getClaimsReport(startDate: string, endDate: string ,destinationId:string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/claims-report`, // Reuse the same endpoint
      { startDate, endDate ,destinationId},
      { responseType: 'blob' }
    );
  }
}