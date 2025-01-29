import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashbaord/main-dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.dashboardData)
    );
  }

  getRevenueChart(range: string): Observable<any[]> {
    // Assuming the endpoint for revenue chart data is similar
    return this.http.get<any[]>(`${this.apiUrl}/revenue-chart?range=${range}`);
  }

  exportDashboardReport(format: 'excel' | 'pdf'): Observable<Blob> {
    // Assuming the endpoint for exporting reports
    return this.http.get(`${this.apiUrl}/export?format=${format}`, { responseType: 'blob' });
  }
}