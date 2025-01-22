import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, ProductStatus } from '../shared/types/product.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, productData);
  }

  updateProduct(id: string, productData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, productData);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  // Inventory
  updateInventory(productId: string, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${productId}/inventory`, { quantity });
  }

  // Bulk Operations
  bulkUpdateStatus(ids: string[], status: ProductStatus): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk/status`, { ids, status });
  }

  bulkUpdatePricing(ids: string[], priceChange: { type: string; value: number }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk/pricing`, { ids, priceChange });
  }

  // Export
  exportProducts(format: 'csv' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  searchProducts(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { term }
    });
  }
}