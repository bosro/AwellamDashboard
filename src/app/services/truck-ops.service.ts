import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Truck } from '../shared/types/truck-operation.types';
import { OperationFormData } from '../shared/types/truck-operation.types';

export interface TruckOperation {
  checklist: any;
  id: number;
  truckId: number;
  truckRegistration: string;
  operationType: 'maintenance' | 'inspection' | 'repair' | 'fuel' | 'service';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  description: string;
  cost?: number;
  technicianName?: string;
  notes?: string;
  attachments?: string[];
  mileage: number;
  priority: 'low' | 'medium' | 'high';
  location: string;
}

export interface MaintenanceSchedule {
  id?: number;
  truckId: number;
  maintenanceType: string;
  scheduledDate: string;
  interval: number;
  intervalUnit: 'days' | 'weeks' | 'months' | 'kilometers';
  lastPerformed?: string;
  description: string;
  checklist: MaintenanceTask[];
}

export interface MaintenanceTask {
  id?: number;
  name: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TruckOpsService {
  private apiUrl = `${environment.apiUrl}/truck-ops`;

  constructor(private http: HttpClient) {}

  // Operations CRUD
  getOperations(params?: any): Observable<{ data: TruckOperation[], total: number }> {
    return this.http.get<{ data: TruckOperation[], total: number }>(
      `${this.apiUrl}/operations`,
      { params }
    );
  }

  getOperationById(id: number): Observable<TruckOperation> {
    return this.http.get<TruckOperation>(`${this.apiUrl}/operations/${id}`);
  }

  createOperation(operation: OperationFormData): Observable<TruckOperation> {
    return this.http.post<TruckOperation>(`${this.apiUrl}/operations`, operation);
  }

  updateOperation(id: number, operation: OperationFormData): Observable<TruckOperation> {
    return this.http.patch<TruckOperation>(`${this.apiUrl}/operations/${id}`, operation);
  }

 

  deleteOperation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/operations/${id}`);
  }

  // Maintenance Schedule Operations
  getMaintenanceSchedules(truckId: number): Observable<MaintenanceSchedule[]> {
    return this.http.get<MaintenanceSchedule[]>(
      `${this.apiUrl}/maintenance-schedules/${truckId}`
    );
  }

  createMaintenanceSchedule(schedule: MaintenanceSchedule): Observable<MaintenanceSchedule> {
    return this.http.post<MaintenanceSchedule>(
      `${this.apiUrl}/maintenance-schedules`,
      schedule
    );
  }

  updateMaintenanceSchedule(id: number, updates: Partial<MaintenanceSchedule>): Observable<MaintenanceSchedule> {
    return this.http.patch<MaintenanceSchedule>(
      `${this.apiUrl}/maintenance-schedules/${id}`,
      updates
    );
  }

  // Task Management
  completeTask(operationId: number, taskId: number, data: any): Observable<MaintenanceTask> {
    return this.http.patch<MaintenanceTask>(
      `${this.apiUrl}/operations/${operationId}/tasks/${taskId}/complete`,
      data
    );
  }

  // Reports and Analytics
  getTruckPerformance(truckId: number, dateRange?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/${truckId}`, { params: dateRange });
  }

  getMaintenanceCosts(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenance-costs`, { params });
  }

  // File Operations
  uploadAttachments(operationId: number, files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<string[]>(
      `${this.apiUrl}/operations/${operationId}/attachments`,
      formData
    );
  }

  // Export Operations
  exportOperations(format: 'excel' | 'pdf', filters?: any): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export/${format}`,
      {
        params: filters,
        responseType: 'blob'
      }
    );
  }

  // Notification Management
  getUpcomingMaintenance(): Observable<MaintenanceSchedule[]> {
    return this.http.get<MaintenanceSchedule[]>(`${this.apiUrl}/upcoming-maintenance`);
  }

  getDueInspections(): Observable<TruckOperation[]> {
    return this.http.get<TruckOperation[]>(`${this.apiUrl}/due-inspections`);
  }



  // getTrucks(): Observable<Truck[]> {
  //   return this.http.get<Truck[]>(`${this.apiUrl}/trucks`);
  // }

  getTrucks(): Observable<Truck[]> {
    // If the API returns a different structure, map it to match our Truck interface
    return this.http.get<any[]>(`${this.apiUrl}/trucks`).pipe(
      map(trucks => trucks.map(truck => ({
        id: truck.id,
        registration: truck.registration || truck.registrationNumber || truck.regNumber // handle different possible property names
      })))
    );
  }

  getLocations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/locations`);
  }

 

 

}