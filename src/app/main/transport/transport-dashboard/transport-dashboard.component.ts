import { Component, OnInit } from '@angular/core';
// import { TransportService, Transport } from '../../../services/driver.service';
import { forkJoin } from 'rxjs';
import { TruckService } from '../../../services/truck.service';

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

interface MaintenanceSchedule {
  id: number;
  truckId: number;
  scheduledDate: string;
  type: string;
  description: string;
  truckRegistration?: string
  maintenanceDate?: string;
  maintenanceType?: string;
}

interface AnalyticsData {
  tripTrends: TripTrend[];
  fuelConsumption: FuelConsumption[];
  routePerformance: RoutePerformance[];
  totalTrips: number;
  activeTrips: number;
  availableTrucks: number;
  availableDrivers: number;
  completedToday: number;
  scheduledToday: number;
  maintenanceAlerts: number;
  fuelEfficiency: number;
}

interface TripTrend {
  date: string;
  count: number;
}

interface FuelConsumption {
  date: string;
  consumption: number;
}

interface RoutePerformance {
  routeId: number;
  routeName: string;
  performance: number;
}

type TransportStatus = 'scheduled' | 'in-transit' | 'completed' | 'cancelled';

@Component({
  selector: 'app-transport-dashboard',
  templateUrl: './transport-dashboard.component.html',
  styleUrls: ['./transport-dashboard.component.scss']
})
export class TransportDashboardComponent implements OnInit {
  metrics!: DashboardMetrics;
  // recentTransports: Transport[] = [];
  maintenanceSchedule: MaintenanceSchedule[] = [];
  loading = false;
  
  // Analytics data
  tripTrends: TripTrend[] = [];
  fuelConsumption: FuelConsumption[] = [];
  routePerformance: RoutePerformance[] = [];

  constructor(private transportService: TruckService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    forkJoin({
      // transports: this.transportService.getTransports({ limit: 5 }),
      // analytics: this.transportService.getTransportAnalytics({ period: 'week' }),
      // maintenance: this.transportService.getMaintenanceSchedule()
    }).subscribe({
      next: (data) => {
        // this.recentTransports = data.transports.data;
        // this.maintenanceSchedule = data.maintenance;
        // this.processAnalytics(data.analytics);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private processAnalytics(data: AnalyticsData): void {
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

  getStatusClass(status: TransportStatus): string {
    const classes: Record<TransportStatus, string> = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }
}