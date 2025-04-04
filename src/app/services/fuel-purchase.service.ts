// src/app/services/fuel-purchase.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FuelPurchase, FuelPurchaseResponse, FuelPurchaseCreateDto, TruckResponse } from '../shared/types/fuel.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FuelPurchaseService {
  private apiUrl = `${environment}/fuelpurchase`;
  private trucksUrl = `${environment}`;

  constructor(private http: HttpClient) { }

  getFuelPurchases(): Observable<FuelPurchaseResponse> {
    return this.http.get<FuelPurchaseResponse>(`${this.apiUrl}/get`);
  }

  createFuelPurchase(purchase: FuelPurchaseCreateDto): Observable<{ success: boolean; data: FuelPurchase }> {
    return this.http.post<{ success: boolean; data: FuelPurchase }>(`${this.apiUrl}/add`, purchase);
  }

  updateFuelPurchase(id: string, purchase: Partial<FuelPurchaseCreateDto>): Observable<{ success: boolean; data: FuelPurchase }> {
    return this.http.put<{ success: boolean; data: FuelPurchase }>(`${this.apiUrl}/edit/${id}`, purchase);
  }

  deleteFuelPurchase(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/delete/${id}`);
  }

  getTrucks(params?: any): Observable<TruckResponse> {
    return this.http.get<TruckResponse>(`${this.trucksUrl}/get`, { params });
  }
}