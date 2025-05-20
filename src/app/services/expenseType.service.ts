import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ExpenseType {
  _id?: string;
  name: string;
  status: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseTypeService {
  private baseUrl = `${environment.apiUrl}/expence-type`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get`);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get/${id}`);
  }

  create(expenseType: ExpenseType): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, expenseType);
  }

  update(id: string, expenseType: ExpenseType): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit/${id}`, expenseType);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}