import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../shared/types/product.interface';
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

  getProducts(params: any): Observable<{ products: Product[] }> {
  return this.http.get<{ products: Product[] }>(`${this.apiUrl}/products`, { params });
}

}