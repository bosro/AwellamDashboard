import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FuelCard, FuelCardResponse, FuelCardCreateDto } from '../shared/types/fuel.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FuelCardService {
  private apiUrl = `${environment.apiUrl}/fuelcard`;
  private plantsUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getFuelCards(): Observable<FuelCardResponse> {
    return this.http.get<FuelCardResponse>(`${this.apiUrl}/get`);
  }

  createFuelCard(fuelCard: FuelCardCreateDto): Observable<{ success: boolean; data: FuelCard }> {
    return this.http.post<{ success: boolean; data: FuelCard }>(`${this.apiUrl}/create`, fuelCard);
  }

  updateFuelCard(id: string, fuelCard: Partial<FuelCardCreateDto>): Observable<{ success: boolean; data: FuelCard }> {
    return this.http.put<{ success: boolean; data: FuelCard }>(`${this.apiUrl}/edit/${id}`, fuelCard);
  }

  deleteFuelCard(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/delete/${id}`);
  }

  getPlants(): Observable<{ plants: any[] }> {
    return this.http.get<{ plants: any[] }>(`${this.plantsUrl}/plants/get`);
  }
}