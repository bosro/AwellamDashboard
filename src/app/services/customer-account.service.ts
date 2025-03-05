import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerAccountService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Get all customers for dropdown selection
   */
  getCustomers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/customers/get`);
  }

  /**
   * Get customer account details with transactions and orders
   * @param customerId - The ID of the customer
   * @param startDate - Start date for report period (YYYY-MM-DD)
   * @param endDate - End date for report period (YYYY-MM-DD)
   */
  getCustomerAccount(customerId: string, startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.baseUrl}/accounts/get/${customerId}`, { params });
  }
}