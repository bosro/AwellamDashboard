import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ProductsResponse} from './products.service';

type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

export interface Purchase {
  _id: string;
  dateOfPurchase: string;
  paymentReference: string;
  purchaseOrderNumber: string;
  productId: { _id: string; name: string } | null;
  categoryId: { _id: string; name: string } | null;
  quantity: number;
  plantId: { _id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseResponse {
  message: string;
  purchases: Purchase[];
  total: number;
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
  private apiUrll =`${environment.apiUrl}`
  constructor(private http: HttpClient) {}

  getPurchases(params?: any): Observable<PurchaseResponse> {
    return this.http.get<PurchaseResponse>(`${this.apiUrl}/get`, { params });
  }

  getPurchaseById(id: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.apiUrl}/${id}`);
  }

  createPurchase(purchase: Omit<Purchase, '_id'>): Observable<Purchase> {
    return this.http.post<Purchase>(`${this.apiUrl}/create`, purchase);
  }

  getCategoriesByPlantId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrll}/category/plants/${id}`);
  }

  getProductsByCategoryId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrll}/products/category/${id}`);
  }

  getPlants(): Observable<Plants> {
    return this.http.get<Plants>(`${this.apiUrl}/getplants`);
  }

  getProductByPlantId(id: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/getproducts/${id}`);
  }

  updatePurchase(id: string, purchase: Partial<Purchase>): Observable<Purchase> {
    return this.http.patch<Purchase>(`${this.apiUrl}/${id}`, purchase);
  }

  deletePurchase(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrll}/purchase/delete/${id}`);
  }

  exportPurchases(ids: string[], format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, { ids, format }, {
      responseType: 'blob'
    });
  }

  bulkUpdateStatus(ids: string[], status: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-update-status`, { ids, status });
  }


}