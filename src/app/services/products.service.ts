import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, ProductStatus } from '../shared/types/product.interface';
import { environment } from '../environments/environment';


export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
}


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/create`, productData);
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


  getProducts(filters: ProductFilters): Observable<ProductsResponse> {
    // Convert filters to query parameters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(`${this.apiUrl}/products/?${params.toString()}`);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateProductStatus(id: string, status: ProductStatus): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/status`, { status });
  }

 

  bulkDelete(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk/delete`, { ids });
  }
}