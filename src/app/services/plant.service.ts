import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Plant {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  plantId: string;
}

export interface Destination{
  _id: string;
  destination: string;
  rates: number;
  plantId: string;
  cost:number
}

export interface DestinationResponse{
  message: string,
  destinations: Destination[]
}

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  createPlant(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/plants/create`, { name });
  }

  getPlants(): Observable<{ plants: Plant[] }> {
    return this.http.get<{ plants: Plant[] }>(`${this.apiUrl}/plants/get`);
  }

  createCategory(data: { name: string; plantId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/category/create`, data);
  }

  createDestination(data: { name: string; plantId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/destination/create`, data);
  }

  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/categories`);
  }

  getDestinationById(id: string): Observable<{ destination: Destination }> {
    return this.http.get<{ destination: Destination }>(`${this.apiUrl}/destination/${id}`);
  }

  updateDestination(id: string, destination: Destination): Observable<any> {
    return this.http.put(`${this.apiUrl}/destination/edit/${id}`, destination);
  }

  getCategoriesByPlant(plantId: string): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/category/plants/${plantId}`);
  }

  getDestinationsByPlant(plantId: string): Observable<{ destinations:  Destination[] }> {
    return this.http.get<{ destinations: Destination[] }>(`${this.apiUrl}/destination/${plantId}/get`);
  }
}