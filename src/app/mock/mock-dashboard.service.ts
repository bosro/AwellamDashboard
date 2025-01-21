import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardMetrics} from './mock-dashboard.interface'

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private mockMetrics: DashboardMetrics = {
    transport: {
      activeDeliveries: 45,
      totalDeliveries: 150,
      pendingDeliveries: 30,
      completedDeliveries: 75
    },
    inventory: {
      lowStockItems: 12,
      totalItems: 500,
      outOfStockItems: 5,
      reorderRequired: 15
    },
    maintenance: {
      pendingMaintenance: 8,
      completedMaintenance: 25,
      scheduledMaintenance: 12,
      totalVehicles: 50
    },
    performance: {
      onTimeDelivery: 92,
      customerSatisfaction: 88,
      vehicleUtilization: 78,
      fuelEfficiency: 85
    }
  };

  private mockRevenueData = {
    today: this.generateRevenueData(24),
    week: this.generateRevenueData(7),
    month: this.generateRevenueData(30),
    year: this.generateRevenueData(12)
  };

  private mockActivityLogs = [
    {
      id: 1,
      action: 'Delivery Completed',
      description: 'Delivery #12345 completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: 'John Driver'
    },
    {
      id: 2,
      action: 'Maintenance Alert',
      description: 'Vehicle TK-201 due for maintenance',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      user: 'System'
    },
    {
      id: 3,
      action: 'Low Stock Alert',
      description: 'Item #789 below minimum threshold',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      user: 'System'
    }
  ];

  private mockAlerts = [
    {
      id: 1,
      type: 'warning',
      message: '3 vehicles due for maintenance this week',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'danger',
      message: 'Critical low stock on 5 items',
      timestamp: new Date()
    }
  ];

  getMetrics(): Observable<DashboardMetrics> {
    return of(this.mockMetrics).pipe(delay(800));
  }

  getActivityLogs(): Observable<any[]> {
    return of(this.mockActivityLogs).pipe(delay(800));
  }

  getAlerts(): Observable<any[]> {
    return of(this.mockAlerts).pipe(delay(800));
  }

  getRevenueChart(range: string): Observable<any[]> {
    return of(this.mockRevenueData[range as keyof typeof this.mockRevenueData]).pipe(delay(800));
  }

  getDeliveryPerformance(): Observable<any[]> {
    return of(this.generatePerformanceData()).pipe(delay(800));
  }

  getInventoryStatus(): Observable<any[]> {
    return of(this.generateInventoryData()).pipe(delay(800));
  }

  getVehicleUtilization(): Observable<any[]> {
    return of(this.generateUtilizationData()).pipe(delay(800));
  }

  getFuelConsumption(): Observable<any[]> {
    return of(this.generateFuelData()).pipe(delay(800));
  }

  exportDashboardReport(format: 'excel' | 'pdf'): Observable<Blob> {
    // Mock blob data
    const mockBlob = new Blob(['Mock dashboard report'], { type: format === 'excel' ? 'application/vnd.ms-excel' : 'application/pdf' });
    return of(mockBlob).pipe(delay(1000));
  }

  private generateRevenueData(points: number): any[] {
    const data = [];
    const baseRevenue = 10000;
    const now = new Date();

    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      date.setHours(date.getHours() - i);
      
      data.unshift({
        timestamp: date,
        revenue: baseRevenue + Math.random() * 5000,
        expenses: baseRevenue * 0.6 + Math.random() * 2000
      });
    }
    return data;
  }

  private generatePerformanceData(): any[] {
    return [
      { metric: 'On-Time Delivery', value: 92 },
      { metric: 'Customer Satisfaction', value: 88 },
      { metric: 'Route Efficiency', value: 85 },
      { metric: 'Load Optimization', value: 78 }
    ];
  }

  private generateInventoryData(): any[] {
    return [
      { category: 'In Stock', value: 450 },
      { category: 'Low Stock', value: 12 },
      { category: 'Out of Stock', value: 5 },
      { category: 'On Order', value: 33 }
    ];
  }

  private generateUtilizationData(): any[] {
    return [
      { vehicle: 'Truck A', utilization: 85 },
      { vehicle: 'Truck B', utilization: 72 },
      { vehicle: 'Truck C', utilization: 93 },
      { vehicle: 'Truck D', utilization: 68 }
    ];
  }

  private generateFuelData(): any[] {
    return [
      { month: 'Jan', consumption: 2500 },
      { month: 'Feb', consumption: 2300 },
      { month: 'Mar', consumption: 2800 },
      { month: 'Apr', consumption: 2400 }
    ];
  }
}