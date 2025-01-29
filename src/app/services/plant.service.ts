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

  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/categories`);
  }

  getCategoriesByPlant(plantId: string): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/category/plants/${plantId}`);
  }
}