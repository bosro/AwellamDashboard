import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardMetrics } from '../shared/types/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  getMetrics(): Observable<DashboardMetrics> {
    const metrics: DashboardMetrics = {
      transport: {
        activeDeliveries: 25
      },
      inventory: {
        lowStockItems: 10
      },
      maintenance: {
        pendingMaintenance: 5
      },
      performance: {
        onTimeDelivery: 95
      }
    };
    return of(metrics);
  }

  getActivityLogs(): Observable<any[]> {
    const logs = [
      { id: 1, message: 'Driver John Doe completed a delivery', timestamp: new Date() },
      { id: 2, message: 'Low stock alert for item ABC123', timestamp: new Date() },
      { id: 3, message: 'Maintenance scheduled for truck XYZ789', timestamp: new Date() }
    ];
    return of(logs);
  }

  getAlerts(): Observable<any[]> {
    const alerts = [
      { id: 1, message: 'High fuel consumption detected', timestamp: new Date() },
      { id: 2, message: 'Driver license expiring soon', timestamp: new Date() }
    ];
    return of(alerts);
  }

  getRevenueChart(range: string): Observable<any[]> {
    const data = [
      { date: '2023-01-01', revenue: 1000 },
      { date: '2023-01-02', revenue: 1500 },
      { date: '2023-01-03', revenue: 2000 }
    ];
    return of(data);
  }

  getDeliveryPerformance(): Observable<any[]> {
    const data = [
      { date: '2023-01-01', performance: 90 },
      { date: '2023-01-02', performance: 85 },
      { date: '2023-01-03', performance: 95 }
    ];
    return of(data);
  }

  getInventoryStatus(): Observable<any[]> {
    const data = [
      { item: 'ABC123', status: 'Low' },
      { item: 'XYZ789', status: 'Normal' }
    ];
    return of(data);
  }

  getVehicleUtilization(): Observable<any[]> {
    const data = [
      { vehicle: 'Truck 1', utilization: 80 },
      { vehicle: 'Truck 2', utilization: 75 }
    ];
    return of(data);
  }

  getFuelConsumption(): Observable<any[]> {
    const data = [
      { date: '2023-01-01', consumption: 50 },
      { date: '2023-01-02', consumption: 60 },
      { date: '2023-01-03', consumption: 55 }
    ];
    return of(data);
  }

  exportDashboardReport(format: 'excel' | 'pdf'): Observable<Blob> {
    const blob = new Blob(['Mock report data'], { type: 'application/octet-stream' });
    return of(blob);
  }
}