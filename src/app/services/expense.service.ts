import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Expense {
  _id?: string;
  truckId: string;
  expenseType: string;
  accountType: string;
  amount: number;
  date: string;
  recipient: string;
  description: string;
  status: string;
  approvedBy?: string;
}

export interface TruckWithDriver {
  _id: string;
  truckNumber: string;
  driver: {
    _id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private baseUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get`);
  }

  getGeneralExpense(): Observable<any> {
    return this.http.get(`${this.baseUrl}/general`);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get/${id}`);
  }

  create(expense: Expense): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, expense);
  }

  update(id: string, expense: Expense): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit/${id}`, expense);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  getTrucks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/trucks/all`);
  }

  getDrivers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/drivers/all`);
  }
}