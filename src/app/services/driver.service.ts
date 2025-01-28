// src/app/services/driver.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver, DriverResponse, CreateDriverDto, UpdateDriverDto } from '../shared/types/driver-types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
 private apiUrl = `${environment.apiUrl}/driver`;;

  constructor(private http: HttpClient) {}

  getDrivers(): Observable<DriverResponse> {
    return this.http.get<DriverResponse>(`${this.apiUrl}/get`);
  }

  getDriverById(id: string): Observable<{message: string, driver: Driver}> {
    return this.http.get<{message: string, driver: Driver}>(`${this.apiUrl}/get/${id}`);
  }

  createDriver(driverData: CreateDriverDto): Observable<{message: string, driver: Driver}> {
    return this.http.post<{message: string, driver: Driver}>(`${this.apiUrl}/create`, driverData);
  }

  updateDriver(id: string, driverData: UpdateDriverDto): Observable<{message: string, driver: Driver}> {
    return this.http.put<{message: string, driver: Driver}>(`${this.apiUrl}/edit/${id}`, driverData);
  }

   deleteDriver(id: string): Observable<Driver> {
        return this.http.delete<Driver>(`${this.apiUrl}/delete/${id}`);
      }
}