import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Destination {
  _id: string;
  plant: string;
  bales: number;
  destination: string;
  rates: number;
}

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  constructor(private http: HttpClient) {}

  getDestinations(plantId: string): Observable<Destination[]> {
    return this.http.get<{ message: string, destinations: Destination[] }>(`${environment.apiUrl}/destination/${plantId}/get`)
      .pipe(
        map(response => response.destinations)  // Extract destinations array
      );
  }
}
