import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Truck, TruckResponse, TruckLoad } from '../shared/types/truck-operation.types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  private apiUrl = `${environment.apiUrl}/trucks`;
  private apiUrll = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getTrucks(params?: any): Observable<TruckResponse> {
    return this.http.get<TruckResponse>(`${this.apiUrl}/get`, { params });
  }

  getTruckById(id: string): Observable<{ message: string; truck: Truck }> {
    return this.http.get<{ message: string; truck: Truck }>(`${this.apiUrl}/get/${id}`);
  }

  createTruck(data: Partial<Truck>): Observable<{ message: string; truck: Truck }> {
    return this.http.post<{ message: string; truck: Truck }>(`${this.apiUrl}/create`, data);
  }

  updateTruck(id: string, data: Partial<Truck>): Observable<{ message: string; truck: Truck }> {
    return this.http.put<{ message: string; truck: Truck }>(`${this.apiUrl}/trucks/${id}`, data);
  }

  loadTruck(data: TruckLoad): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/load`, data);
  }

  getInactiveTrucks(): Observable<{ trucks: Truck[] }> {
    return this.http.get<{ trucks: Truck[] }>(`${this.apiUrl}/get`);
  }

  assignSocToTruck(truckId: string, socId: string): Observable<any> {
    return this.http.post(`${this.apiUrll}/soc/trucks/${truckId}/assign-soc/${socId}`, {});
  }


 borrowedOrder( socId: string ,recipient: any): Observable<any> {
    return this.http.put(`${this.apiUrll}/soc/borrowed/${socId}`, recipient);
  }
  

  // unloadTruck(id: string): Observable<Truck> {
  //   return this.http.put<Truck>(`${this.apiUrl}/unload/${id}`, {});
  // }

  unloadTruck(truckId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${truckId}/unload`, {});
  }

 
    deleteTruck(id: string): Observable<Truck> {
      return this.http.delete<Truck>(`${this.apiUrl}/trucks/${id}`);
    }
}