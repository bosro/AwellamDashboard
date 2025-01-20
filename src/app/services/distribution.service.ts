import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type DistributionStatus = 'pending' | 'in-transit' | 'delivered' | 'cancelled';


export interface Distribution {
  id: number;
  date: string;
  customerName: string;
  productType: string;
  quantity: number;
  price: number;
  driverId: number;
  driverName?: string;
  truckId: number;
  truckRegistration?: string;
  salesOrderNumber: string;
  plant: string;
  status: DistributionStatus;
  totalAmount?: number;
  deliveryAddress?: string;
  contactPerson?: string;
  contactNumber?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime: string | null;
  notes?: string;
  driverAssignedAt: string | null;
  transitStartTime: string | null;
}


export interface Driver {
  id: number;
  name: string;
  status: 'available' | 'on-delivery' | 'off-duty';
  licenseNumber: string;
}

export interface Truck {
  id: number;
  registrationNumber: string;
  status: 'available' | 'in-use' | 'maintenance';
  location: string;
}

export interface DistributionService {
  getDistributions(params: any): Observable<{ data: Distribution[]; total: number }>;
  optimizeDeliveryRoute(orderIds: number[]): Observable<any>;
  exportDistributions(format: 'excel' | 'pdf', orderIds: number[]): Observable<Blob>;
}


export interface DistributionUpdate extends Partial<Pick<Distribution, 
  'status' | 'notes' | 'driverId' | 'truckId'
>> {}

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private apiUrl = `${environment.apiUrl}/distribution`;

  constructor(private http: HttpClient) {}

  // Distribution CRUD
  getDistributions(params?: any): Observable<{ data: Distribution[], total: number }> {
    return this.http.get<{ data: Distribution[], total: number }>(
      `${this.apiUrl}/orders`, 
      { params }
    );
  }

  getDistributionById(id: number): Observable<Distribution> {
    return this.http.get<Distribution>(`${this.apiUrl}/orders/${id}`);
  }

  createDistribution(distribution: Omit<Distribution, 'id'>): Observable<Distribution> {
    return this.http.post<Distribution>(`${this.apiUrl}/orders`, distribution);
  }

  updateDistribution(id: number, distribution: Partial<Distribution>): Observable<Distribution> {
    return this.http.patch<Distribution>(`${this.apiUrl}/orders/${id}`, distribution);
  }

 

  // Driver Operations
  getAvailableDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.apiUrl}/drivers/available`);
  }

  updateDriverStatus(id: number, status: string): Observable<Driver> {
    return this.http.patch<Driver>(`${this.apiUrl}/drivers/${id}/status`, { status });
  }

  // Truck Operations
  getAvailableTrucks(location: string): Observable<Truck[]> {
    return this.http.get<Truck[]>(`${this.apiUrl}/trucks/available`, { 
      params: { location } 
    });
  }

  updateTruckStatus(id: number, status: string): Observable<Truck> {
    return this.http.patch<Truck>(`${this.apiUrl}/trucks/${id}/status`, { status });
  }

  deleteDistribution(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/distributions/${id}`);
  }
  
  // Export Operations
  // exportDistributions(format: 'excel' | 'pdf', ids?: number[]): Observable<Blob> {
  //   const params = ids ? { ids: ids.join(',') } : {};
  //   return this.http.get(`${this.apiUrl}/export/${format}`, { 
  //     params,
  //     responseType: 'blob' 
  //   });
  // }

  // Analytics
  getDistributionAnalytics(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`, { params });
  }

  // Route Optimization
  optimizeDeliveryRoute(orders: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/optimize-route`, { orders });
  }
}