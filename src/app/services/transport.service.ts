import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

// Updated Truck Interface to match the provided JSON structure
export interface Truck {
  _id: string;
  truckNumber: string;
  capacity: number;
  expenses: number;
  status: 'active' | 'inactive' | 'maintenance';
  product: string | null;
  orderId: string | null;
  deliveredOrders: any[];
  expenditure: any[];
  __v: number;


}

// Response interface for API calls
export interface TruckResponse {
  message: string;
  trucks: Truck[];
}

export interface DriverResponse{
  message:string,
  drivers: Driver[]
}

export interface Driver {
  _id: string;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  truck: Truck | null;
  status: 'available' | 'on-duty' | 'off-duty' | 'on-leave';
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
  private apiUrl = `${environment.apiUrl}`;

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

  // createTransport(transport: Omit<Transport, 'id'>): Observable<Transport> {
  //   return this.http.post<Transport>(`${this.apiUrl}/trips`, transport);
  // }

  updateTransport(id: number, transport: Partial<Transport>): Observable<Transport> {
    return this.http.patch<Transport>(`${this.apiUrl}/trips/${id}`, transport);
  }

  // Truck Operations
  // getTrucks(params?: any): Observable<TruckResponse> {
  //   const httpParams = new HttpParams({ fromObject: params });
  //   return this.http.get<TruckResponse>(`${this.apiUrl}/truck/get`, { params: httpParams });
  // }


   getTrucks(params?: Record<string, any>): Observable<TruckResponse>  {
      let httpParams = new HttpParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          httpParams = httpParams.set(key, value);
        });
      }
      return this.http.get<TruckResponse> (`${this.apiUrl}/truck/get`, { params: httpParams });
    }
  
 


  getTruckById(id: string): Observable<Truck> { // Changed id type to string to match _id
    return this.http.get<Truck>(`${this.apiUrl}/trucks/${id}`);
  }

  updateTruckStatus(id: string, status: string): Observable<Truck> { // Changed id type to string to match _id
    return this.http.patch<Truck>(`${this.apiUrl}/trucks/${id}/status`, { status });
  }

  recordFuelRefill(truckId: string, refillData: FuelRefill): Observable<any> { // Changed truckId type to string to match _id
    return this.http.post(`${this.apiUrl}/trucks/${truckId}/fuel-refills`, refillData);
  }
  
  scheduleMaintenance(id: string, date: string): Observable<Truck> { // Changed id type to string to match _id
    return this.http.post<Truck>(
      `${this.apiUrl}/trucks/${id}/maintenance`,
      { maintenanceDate: date }
    );
  }

  // Driver Operations
  // getDrivers(params?: any): Observable< Observable<TruckResponse>  > {
  //   return this.http.get<{ data: Driver[], total: number }>(
  //     `${this.apiUrl}/drivers`,
  //     { params }
  //   );
  // }

  getDrivers(params?: Record<string, any>): Observable<DriverResponse>  {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, value);
      });
    }
    return this.http.get<DriverResponse> (`${this.apiUrl}/driver/get`, { params: httpParams });
  }


  updateDriverStatus(id: string, status: string): Observable<Driver> { // Changed id type to string to match _id
    return this.http.patch<Driver>(`${this.apiUrl}/drivers/${id}/status`, { status });
  }

  assignDriver(tripId: number, driverId: string): Observable<Transport> { // Changed driverId type to string to match _id
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

  getFuelConsumptionReport(truckId: string, dateRange: any): Observable<any> { // Changed truckId type to string to match _id
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

  getTruckMaintenanceHistory(truckId: string): Observable<MaintenanceRecord[]> { // Changed truckId type to string to match _id
    return this.http.get<MaintenanceRecord[]>(`${this.apiUrl}/trucks/${truckId}/maintenance-history`);
  }

  getTruckFuelHistory(truckId: string): Observable<FuelRecord[]> { // Changed truckId type to string to match _id
    return this.http.get<FuelRecord[]>(`${this.apiUrl}/trucks/${truckId}/fuel-history`);
  }

  getTruckAnalytics(truckId: string): Observable<any> { // Changed truckId type to string to match _id
    return this.http.get(`${this.apiUrl}/trucks/${truckId}/analytics`);
  }
}