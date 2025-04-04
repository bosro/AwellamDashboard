// self-list.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SelfListService {
  private baseUrl = `${environment.apiUrl}/selflist`;

  constructor(private http: HttpClient) { }

  getOrders(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get(`${this.baseUrl}/get`, { params });
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/status/${id}`, { status });
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}