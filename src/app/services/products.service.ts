import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';



export interface Product {
  _id: string;
  name: string;
costprice: number;
  inStock: boolean;
  image: string;
  plantId:{
    _id: string;
    name: string
  };
  totalStock: number;
}


export interface ProductsResponse {
  message: string;
  products: Product[];
}

export interface ProductResponse {
  message: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(params: any): Observable<ProductsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<ProductsResponse>(`${this.apiUrl}/get`, { params: httpParams });
  }
  getProductByPlant(plantId: string): Observable<{ products: Product[] }> {
     return this.http.get<{ products: Product[]}>(`${this.apiUrl}/get/${plantId}`);
   }

  getProductById(id: string): Observable<Product> {
    return this.http.get<{ message: string, product: Product }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.product));
  }

  createProduct(productData: any): Observable<Product> {
    return this.http.post<any>(`${this.apiUrl}/create`, productData);
  }

  updateProduct(id: string, productData: any): Observable<Product> {
    return this.http.put<any>(`${this.apiUrl}/edit/${id}`, productData);
  }

  addStock(id: string, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/add-stock`, { quantity });
  }

  toggleStock(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/toggle-stock`, {});
  }

  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/delete/${id}`);
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