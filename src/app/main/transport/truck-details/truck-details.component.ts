import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportService, Truck } from '../../services/transport.service';
import { forkJoin } from 'rxjs';

interface MaintenanceRecord {
  id: number;
  date: string;
  type: string;
  description: string;
  cost: number;
  technicianName: string;
  status: 'completed' | 'scheduled' | 'in-progress';
  nextServiceDate?: string;
}

interface FuelRecord {
  id: number;
  date: string;
  quantity: number;
  cost: number;
  location: string;
  odometerReading: number;
  fuelType: string;
}

@Component({
  selector: 'app-truck-details',
  templateUrl: './truck-details.component.html'
})
export class TruckDetailsComponent implements OnInit {
  truck: Truck;
  maintenanceHistory: MaintenanceRecord[] = [];
  fuelHistory: FuelRecord[] = [];
  loading = false;
  
  // Analytics data
  fuelEfficiencyTrend = [];
  maintenanceCostTrend = [];
  utilizationRate = [];

  // Performance metrics
  averageFuelConsumption: number;
  totalMaintenanceCost: number;
  totalDistanceCovered: number;
  uptime: number;

  constructor(
    private transportService: TransportService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadTruckDetails(id);
  }

  private loadTruckDetails(id: number): void {
    this.loading = true;

    // Load all truck-related data in parallel
    forkJoin({
      truck: this.transportService.getTruckById(id),
      maintenance: this.loadMaintenanceHistory(id),
      fuel: this.loadFuelHistory(id),
      analytics: this.loadTruckAnalytics(id)
    }).subscribe({
      next: (data) => {
        this.truck = data.truck;
        this.maintenanceHistory = data.maintenance;
        this.fuelHistory = data.fuel;
        this.processAnalytics(data.analytics);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading truck details:', error);
        this.loading = false;
      }
    });
  }

  private loadMaintenanceHistory(truckId: number): Observable<MaintenanceRecord[]> {
    return this.transportService.getTruckMaintenanceHistory(truckId);
  }

  private loadFuelHistory(truckId: number): Observable<FuelRecord[]> {
    return this.transportService.getTruckFuelHistory(truckId);
  }

  private loadTruckAnalytics(truckId: number): Observable<any> {
    return this.transportService.getTruckAnalytics(truckId);
  }

  private processAnalytics(data: any): void {
    this.fuelEfficiencyTrend = data.fuelEfficiency;
    this.maintenanceCostTrend = data.maintenanceCosts;
    this.utilizationRate = data.utilization;

    // Calculate performance metrics
    this.calculatePerformanceMetrics();
  }

  private calculatePerformanceMetrics(): void {
    // Calculate average fuel consumption (L/100km)
    this.averageFuelConsumption = this.fuelHistory.reduce((acc, curr) => {
      return acc + (curr.quantity / (curr.odometerReading * 100));
    }, 0) / this.fuelHistory.length;

    // Calculate total maintenance cost
    this.totalMaintenanceCost = this.maintenanceHistory.reduce((acc, curr) => {
      return acc + curr.cost;
    }, 0);

    // Calculate total distance covered
    const latestRecord = this.fuelHistory[this.fuelHistory.length - 1];
    const firstRecord = this.fuelHistory[0];
    this.totalDistanceCovered = latestRecord?.odometerReading - firstRecord?.odometerReading || 0;

    // Calculate uptime percentage
    const totalDays = this.calculateTotalDays();
    const maintenanceDays = this.calculateMaintenanceDays();
    this.uptime = ((totalDays - maintenanceDays) / totalDays) * 100;
  }

  private calculateTotalDays(): number {
    const firstRecord = this.maintenanceHistory[0];
    if (!firstRecord) return 0;
    
    const start = new Date(firstRecord.date);
    const end = new Date();
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateMaintenanceDays(): number {
    return this.maintenanceHistory
      .filter(record => record.status === 'completed')
      .reduce((total, record) => total + 1, 0); // Assuming 1 day per maintenance
  }

  getMaintenanceStatusClass(status: string): string {
    const classes = {
      'completed': 'bg-green-100 text-green-800',
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800'
    };
    return classes[status] || '';
  }

  scheduleMaintenance(): void {
    // Implement maintenance scheduling logic
  }

  recordFuelRefill(): void {
    // Implement fuel refill recording logic
  }

  exportMaintenanceHistory(format: 'excel' | 'pdf'): void {
    // Implement export functionality
  }

  getNextMaintenanceDate(): Date {
    const scheduledMaintenance = this.maintenanceHistory
      .find(m => m.status === 'scheduled');
    return scheduledMaintenance ? new Date(scheduledMaintenance.date) : null;
  }

  getDaysUntilMaintenance(): number {
    const nextDate = this.getNextMaintenanceDate();
    if (!nextDate) return null;
    
    const today = new Date();
    return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}