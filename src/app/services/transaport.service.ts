import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private apiUrl = `${environment.apiUrl}/dashboard/transport-dashboard`;

  constructor(private http: HttpClient) {}

  getTransportDashboardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}