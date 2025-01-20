import { Component, OnInit } from '@angular/core';
import { TransportService } from '../../services/transport.service';
import { forkJoin } from 'rxjs';

interface DashboardMetrics {
  totalTrips: number;
  activeTrips: number;
  availableTrucks: number;
  availableDrivers: number;
  completedToday: number;
  scheduledToday: number;
  maintenanceAlerts: number;
  fuelEfficiency: number;
}

@Component({
  selector: 'app-transport-dashboard',
  templateUrl: './transport-dashboard.component.html',
  styleUrls: ['./transport-dashboard.component.scss']
})
export class TransportDashboardComponent implements OnInit {
  metrics: DashboardMetrics;
  recentTransports = [];
  maintenanceSchedule = [];
  loading = false;
  
  // Analytics data
  tripTrends = [];
  fuelConsumption = [];
  routePerformance = [];

  constructor(private transportService: TransportService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    forkJoin({
      transports: this.transportService.getTransports({ limit: 5 }),
      analytics: this.transportService.getTransportAnalytics({ period: 'week' }),
      maintenance: this.transportService.getMaintenanceSchedule()
    }).subscribe({
      next: (data) => {
        this.recentTransports = data.transports.data;
        this.maintenanceSchedule = data.maintenance;
        this.processAnalytics(data.analytics);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private processAnalytics(data: any): void {
    this.metrics = {
      totalTrips: data.totalTrips,
      activeTrips: data.activeTrips,
      availableTrucks: data.availableTrucks,
      availableDrivers: data.availableDrivers,
      completedToday: data.completedToday,
      scheduledToday: data.scheduledToday,
      maintenanceAlerts: data.maintenanceAlerts,
      fuelEfficiency: data.fuelEfficiency
    };

    this.tripTrends = data.tripTrends;
    this.fuelConsumption = data.fuelConsumption;
    this.routePerformance = data.routePerformance;
  }

  getStatusClass(status: string): string {
    const classes = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }
}