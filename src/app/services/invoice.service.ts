import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
// import { ProductsResponse, InvoiceCreateRequest } from '../shared/types/invoice-types';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}`

  constructor(private http: HttpClient) { }

  getProducts(params: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/products/get`, { params: httpParams });
  }


  getAllInvoices(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/new-invoice/get`);
}

  saveInvoice(invoiceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/new-invoice/create`, invoiceData);
  }

  // Optional: Get invoice by ID
  getInvoice(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/new-invoice/get/${id}`);
  }

  // Optional: Update invoice
  updateInvoice(id: string, invoiceData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/new-invoice/edit/${id}`, invoiceData);
  }
}