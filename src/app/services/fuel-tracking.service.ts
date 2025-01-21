import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface FuelRecord {
  id?: number;
  truckId: number;
  date: string;
  quantity: number;
  cost: number;
  location: string;
  odometerReading: number;
  fuelType: string;
  fuelEfficiency?: number;
  pricePerLiter?: number;
}

export interface FuelAnalytics {
  averageConsumption: number;
  totalCost: number;
  efficiency: number;
  trends: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FuelTrackingService {
  private apiUrl = `${environment.apiUrl}/fuel`;

  constructor(private http: HttpClient) {}

  getFuelRecords(truckId: number): Observable<FuelRecord[]> {
    return this.http.get<FuelRecord[]>(`${this.apiUrl}/records/${truckId}`);
  }

  addFuelRecord(record: Omit<FuelRecord, 'id'>): Observable<FuelRecord> {
    return this.http.post<FuelRecord>(`${this.apiUrl}/records`, record);
  }

  getFuelAnalytics(truckId: number, dateRange?: { start: string; end: string }): Observable<FuelAnalytics> {
    return this.http.get<FuelAnalytics>(`${this.apiUrl}/analytics/${truckId}`, {
      params: dateRange
    });
  }

  calculateFuelEfficiency(distance: number, fuelUsed: number): number {
    return (fuelUsed / distance) * 100; // L/100km
  }

  getFuelLevelAlert(currentLevel: number, capacity: number): 'low' | 'medium' | 'good' {
    const percentage = (currentLevel / capacity) * 100;
    if (percentage <= 20) return 'low';
    if (percentage <= 40) return 'medium';
    return 'good';
  }

  exportFuelData(truckId: any, format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${truckId}/${format}`, {
      responseType: 'blob'
    });
  }
}