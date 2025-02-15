import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;
  private apiUrll = `${environment.apiUrl}/soc/reports`;

  constructor(private http: HttpClient) {}



  getSOCReport(startDate: string, endDate: string): Observable<Blob> {
    const url = `${this.apiUrll}/export`;
    return this.http.get(url, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }


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

  

  // getClaimsReport(startDate: string, endDate: string ,destinationId:string): Observable<Blob> {
  //   return this.http.post(
  //     `${this.apiUrl}/claims-report`, // Reuse the same endpoint
  //     { startDate, endDate ,destinationId},
  //     { responseType: 'blob' }
  //   );
  // }

  getClaimsReport(
    page: number,
    location: string,
    plant: string,
    startDate: string,
    endDate: string
  ): Observable<Blob> {
    const params = {
      page: page.toString(),
      location,
      plant,
      startDate,
      endDate,
    };
  
    return this.http.get(`${this.apiUrl}/claims-report`, {
      params,
      responseType: 'blob', // Ensure the response is treated as a Blob
    });
  }
}