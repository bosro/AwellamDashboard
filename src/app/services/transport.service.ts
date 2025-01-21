import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { MaintenanceRecord } from '../main/transport/maintenance-history/maintenance-history.component';
import { FuelRecord } from './fuel-tracking.service';
import { FuelRefill } from '../main/transport/truck-details/truck-details.component';

export interface Transport {
  id: number;
  truckId: number;
  driverId: number;
  routeId: number;
  startLocation: string;
  endLocation: string;
  status: 'scheduled' | 'in-transit' | 'completed' | 'cancelled';
  startTime: string;
  estimatedEndTime: string;
  actualEndTime?: string;
  distance: number;
  fuelConsumption: number;
  loadCapacity: number;
  currentLoad: number;
  notes?: string;
  driverName?: string;
  truckRegistration?: string;
}

export interface Truck {
  id: number;
  registrationNumber: string;
  model: string;
  capacity: number;
  currentLocation: string;
  status: 'available' | 'in-use' | 'maintenance';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  fuelCapacity: number;
  currentFuelLevel: number;
  mileage: number;
}

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  status: 'available' | 'on-duty' | 'off-duty' | 'on-leave';
  experience: number;
  totalTrips: number;
  rating: number;
  licenseExpiry: string;
}

export interface Route {
  id: number;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedDuration: number;
  waypoints?: string[];
  restrictions?: string[];
  trafficConditions: 'light' | 'moderate' | 'heavy';
}

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private apiUrl = `${environment.apiUrl}/transport`;

  constructor(private http: HttpClient) {}

  // Transport Operations
  getTransports(params?: any): Observable<{ data: Transport[], total: number }> {
    return this.http.get<{ data: Transport[], total: number }>(
      `${this.apiUrl}/trips`,
      { params }
    );
  }

  getTransportById(id: number): Observable<Transport> {
    return this.http.get<Transport>(`${this.apiUrl}/trips/${id}`);
  }

  createTransport(transport: Omit<Transport, 'id'>): Observable<Transport> {
    return this.http.post<Transport>(`${this.apiUrl}/trips`, transport);
  }

  updateTransport(id: number, transport: Partial<Transport>): Observable<Transport> {
    return this.http.patch<Transport>(`${this.apiUrl}/trips/${id}`, transport);
  }

  // Truck Operations
  getTrucks(params?: any): Observable<{ data: Truck[], total: number }> {
    return this.http.get<{ data: Truck[], total: number }>(
      `${this.apiUrl}/trucks`,
      { params }
    );
  }

  getTruckById(id: number): Observable<Truck> {
    return this.http.get<Truck>(`${this.apiUrl}/trucks/${id}`);
  }

  updateTruckStatus(id: number, status: string): Observable<Truck> {
    return this.http.patch<Truck>(`${this.apiUrl}/trucks/${id}/status`, { status });
  }

  recordFuelRefill(truckId: number, refillData: FuelRefill): Observable<any> {
    return this.http.post(`${this.apiUrl}/trucks/${truckId}/fuel-refills`, refillData);
  }
  
  scheduleMaintenance(id: number, date: string): Observable<Truck> {
    return this.http.post<Truck>(
      `${this.apiUrl}/trucks/${id}/maintenance`,
      { maintenanceDate: date }
    );
  }

  // Driver Operations
  getDrivers(params?: any): Observable<{ data: Driver[], total: number }> {
    return this.http.get<{ data: Driver[], total: number }>(
      `${this.apiUrl}/drivers`,
      { params }
    );
  }

  updateDriverStatus(id: number, status: string): Observable<Driver> {
    return this.http.patch<Driver>(`${this.apiUrl}/drivers/${id}/status`, { status });
  }

  assignDriver(tripId: number, driverId: number): Observable<Transport> {
    return this.http.post<Transport>(
      `${this.apiUrl}/trips/${tripId}/assign-driver`,
      { driverId }
    );
  }

  // Route Operations
  getRoutes(params?: any): Observable<{ data: Route[], total: number }> {
    return this.http.get<{ data: Route[], total: number }>(
      `${this.apiUrl}/routes`,
      { params }
    );
  }

  optimizeRoute(waypoints: string[]): Observable<Route> {
    return this.http.post<Route>(
      `${this.apiUrl}/routes/optimize`,
      { waypoints }
    );
  }

  // Analytics and Reports
  getTransportAnalytics(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`, { params });
  }

  getFuelConsumptionReport(truckId: number, dateRange: any): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/trucks/${truckId}/fuel-consumption`,
      { params: dateRange }
    );
  }

  getMaintenanceSchedule(): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenance-schedule`);
  }

  exportTransportData(format: 'excel' | 'pdf', filters?: any): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export/${format}`,
      {
        params: filters,
        responseType: 'blob'
      }
    );
  }

  getMaintenanceRecords(): Observable<MaintenanceRecord[]> {
    return this.http.get<MaintenanceRecord[]>(`${this.apiUrl}/maintenance`);
  }

  createMaintenanceRecord(record: Partial<MaintenanceRecord>): Observable<MaintenanceRecord> {
    return this.http.post<MaintenanceRecord>(`${this.apiUrl}/maintenance`, record);
  }

  exportMaintenanceData(format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/maintenance/export/${format}`, {
      responseType: 'blob'
    });
  }

  getTruckMaintenanceHistory(truckId: number): Observable<MaintenanceRecord[]> {
    return this.http.get<MaintenanceRecord[]>(`${this.apiUrl}/trucks/${truckId}/maintenance-history`);
  }

  getTruckFuelHistory(truckId: number): Observable<FuelRecord[]> {
    return this.http.get<FuelRecord[]>(`${this.apiUrl}/trucks/${truckId}/fuel-history`);
  }

  getTruckAnalytics(truckId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/trucks/${truckId}/analytics`);
  }
}