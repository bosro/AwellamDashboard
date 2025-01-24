import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';


export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  totalStock: number;
  image: string;
}

export interface ProductsResponse {
  message: string;
  products: Product[];
}

interface ProductResponse {
  message: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.product)
    );
  }

  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/create`, productData);
  }

  updateProduct(id: string, productData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/edit/${id}`, productData);
  }

  addStock(id: string, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/add-stock`, { quantity });
  }

  toggleStock(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/toggle-stock`, {});
  }

  deleteProduct(id: string, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/delete/${id}`, { quantity });
  }

  exportToExcel(products: Product[]): void {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(products);
      const workbook = { Sheets: { 'Products': worksheet }, SheetNames: ['Products'] };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'products.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}