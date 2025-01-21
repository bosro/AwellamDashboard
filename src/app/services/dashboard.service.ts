import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface DashboardMetrics {
  transport: {
    activeDeliveries: number;
    completedToday: number;
    totalRevenue: number;
    deliveryEfficiency: number;
  };
  inventory: {
    totalItems: number;
    lowStockItems: number;
    stockValue: number;
    recentDisbursements: number;
  };
  maintenance: {
    pendingMaintenance: number;
    maintenanceCosts: number;
    upcomingServices: number;
    completedServices: number;
  };
  claims: {
    pendingClaims: number;
    approvedClaims: number;
    totalClaimValue: number;
    processingTime: number;
  };
  performance: {
    onTimeDelivery: number ;
    fuelEfficiency: number;
    vehicleUtilization: number;
    customerSatisfaction: number;
  };
}

export interface ActivityLog {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  status: string;
  user: string;
  module: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`);
  }

  getActivityLogs(params?: any): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/activity-logs`, { params });
  }

  getRevenueChart(period: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/charts/revenue`, { 
      params: { period } 
    });
  }

  getDeliveryPerformance(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/charts/delivery-performance`, { 
      params 
    });
  }

  getInventoryStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/charts/inventory-status`);
  }

  getMaintenanceSchedule(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/maintenance-schedule`);
  }

  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alerts`);
  }

  getVehicleUtilization(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vehicle-utilization`);
  }

  getFuelConsumption(dateRange?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fuel-consumption`, {
      params: dateRange
    });
  }

  getCustomerSatisfaction(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customer-satisfaction`);
  }

  exportDashboardReport(format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${format}`, {
      responseType: 'blob'
    });
  }

  getUpcomingDeliveries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/upcoming-deliveries`);
  }

  getPendingApprovals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-approvals`);
  }
}