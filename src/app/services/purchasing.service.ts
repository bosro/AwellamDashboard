import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ProductsResponse} from './products.service';

type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

export interface Purchase {
  id: number;
  purchaseDate: string;
  paymentReference: string;
  salesOrderNumber: string;
  productType: string;
  quantity: number;
  location: string;
  // status: 'pending' | 'completed' | 'cancelled';
  status: PurchaseStatus;
}

export interface Plant{
  _id: string;
  name: string;
}

export interface Plants{
  message: string;
  plants:[]
}

@Injectable({
  providedIn: 'root'
})
export class PurchasingService {
  private apiUrl = `${environment.apiUrl}/purchase`;

  constructor(private http: HttpClient) {}

  getPurchases(params?: any): Observable<{ data: Purchase[], total: number }> {
    return this.http.get<{ data: Purchase[], total: number }>(this.apiUrl, { params });
  }

  getPurchaseById(id: number): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.apiUrl}/${id}`);
  }

  createPurchase(purchase: Omit<Purchase, 'id'>): Observable<Purchase> {
    return this.http.post<Purchase>(this.apiUrl, purchase);
  }

  //  getProducts(): Observable<ProductsResponse> {
  //     return this.http.get<ProductsResponse>(`${this.apiUrl}/`);
  //   }

  getPlants(): Observable<Plants> {
    return this.http.get<Plants>(`${this.apiUrl}/getplants`);
  }

  getProductByPlantId(id: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/getproducts/${id}`);
  }


  updatePurchase(id: number, purchase: Partial<Purchase>): Observable<Purchase> {
    return this.http.patch<Purchase>(`${this.apiUrl}/${id}`, purchase);
  }

  deletePurchase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exportPurchases(ids: number[], format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, { ids, format }, {
      responseType: 'blob'
    });
  }

  bulkUpdateStatus(ids: number[], status: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-update-status`, { ids, status });
  }


}