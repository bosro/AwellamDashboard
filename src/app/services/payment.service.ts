export interface Plant {
    id: number;
    name: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    plantId: number;
  }
  
  export interface Product {
    id: number;
    name: string;
    categoryId: number;
  }
  
  export interface SOC {
    id?: number;
    soNumber: string;
    plantId: number;
    plantName: string; // Added to match dummy data
    categoryId: number;
    categoryName: string; // Added to match dummy data
    productId: number;
    productName: string; // Added to match dummy data
    quantity: number;
    orderType: string;
    driverId?: number;
    paymentRefId?: string; // Made optional to match dummy data
  }
  
  export interface PaymentRef {
    id: string;
    paymentField: string; // Added to match dummy data
    plantId: number;
    plant: Plant;
    createdAt: Date;
    socs?: SOC[];
  }
  
  export interface Driver {
    id: number;
    name: string;
  }
  
  // src/app/services/api.service.ts
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
//   import { Plant, Category, Product, SOC, PaymentRef, Driver } from '../interfaces/models';
  
  @Injectable({
    providedIn: 'root'
  })
  export class ApiService {
    private baseUrl = 'api/v1'; // Replace with your API base URL
  
    constructor(private http: HttpClient) {}
  
    getPaymentRefs(): Observable<PaymentRef[]> {
      return this.http.get<PaymentRef[]>(`${this.baseUrl}/payment-refs`);
    }
  
    getPaymentRefDetails(id: string): Observable<PaymentRef> {
      return this.http.get<PaymentRef>(`${this.baseUrl}/payment-refs/${id}`);
    }
  
    getPlants(): Observable<Plant[]> {
      return this.http.get<Plant[]>(`${this.baseUrl}/plants`);
    }
  
    getCategories(plantId: number): Observable<Category[]> {
      return this.http.get<Category[]>(`${this.baseUrl}/plants/${plantId}/categories`);
    }
  
    getProducts(categoryId: number): Observable<Product[]> {
      return this.http.get<Product[]>(`${this.baseUrl}/categories/${categoryId}/products`);
    }
  
    getDrivers(): Observable<Driver[]> {
      return this.http.get<Driver[]>(`${this.baseUrl}/drivers`);
    }
  
    assignDriver(socId: number, driverId: number): Observable<SOC> {
      return this.http.patch<SOC>(`${this.baseUrl}/socs/${socId}/assign-driver`, { driverId });
    }
  
    createPaymentRef(plantId: number): Observable<PaymentRef> {
      return this.http.post<PaymentRef>(`${this.baseUrl}/payment-refs`, { plantId });
    }
  
    createSOC(soc: Omit<SOC, 'id'>): Observable<SOC> {
      return this.http.post<SOC>(`${this.baseUrl}/socs`, soc);
    }
  }
  