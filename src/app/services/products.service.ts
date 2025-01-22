import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, ProductVariant, ProductStatus } from '../shared/types/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(params?: any): Observable<{ data: Product[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<{ data: Product[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Variants
  addVariant(productId: string, variant: Partial<ProductVariant>): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.apiUrl}/${productId}/variants`, variant);
  }

  updateVariant(productId: string, variantId: string, variant: Partial<ProductVariant>): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.apiUrl}/${productId}/variants/${variantId}`, variant);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
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