import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportService, Truck } from '../../../services/driver.service';
import { forkJoin, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type TruckStatus = 'available' | 'in-use' | 'maintenance';

interface MaintenanceRecord {
  id: number;
  date: string;
  type: string;
  description: string;
  cost: number;
  technicianName: string;
  status: MaintenanceStatus;
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

export interface FuelRefill {
  quantity: number;
  cost: number;
  location: string;
  odometerReading: number;
  fuelType: string;
  date: string;
}

type MaintenanceStatus = 'completed' | 'scheduled' | 'in-progress';

interface TruckAnalytics {
  fuelEfficiency: any[];
  maintenanceCosts: any[];
  utilization: any[];
}

@Component({
  selector: 'app-truck-details',
  templateUrl: './truck-details.component.html',
})
export class TruckDetailsComponent implements OnInit {
  truck!: Truck;
  maintenanceHistory: MaintenanceRecord[] = [];
  fuelHistory: FuelRecord[] = [];
  loading = false;

  // Modal states
  showFuelRefillModal = false;
  showMaintenanceModal = false;

  // Forms
  fuelRefillForm!: FormGroup;
  maintenanceForm!: FormGroup;

  // Analytics data
  fuelEfficiencyTrend: any[] = [];
  maintenanceCostTrend: any[] = [];
  utilizationRate: any[] = [];

  // Performance metrics
  averageFuelConsumption = 0;
  totalMaintenanceCost = 0;
  totalDistanceCovered = 0;
  uptime = 0;

  constructor(
    private transportService: TransportService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createForms();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    // this.loadTruckDetails(id);
  }

  getStatusClass(status: TruckStatus): string {
    const statusClasses: Record<TruckStatus, string> = {
      available: 'bg-green-100 text-green-800',
      'in-use': 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };
    return statusClasses[status];
  }

  // private loadTruckDetails(id: number): void {
  //   this.loading = true;

  //   // Load all truck-related data in parallel
  //   forkJoin({
  //     truck: this.transportService.getTruckById(id),
  //     maintenance: this.loadMaintenanceHistory(id),
  //     // fuel: this.loadFuelHistory(id),
  //     analytics: this.loadTruckAnalytics(id),
  //   }).subscribe({
  //     next: (data) => {
  //       this.truck = data.truck;
  //       this.maintenanceHistory = data.maintenance;
  //       // this.fuelHistory = data.fuel;
  //       this.processAnalytics(data.analytics);
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading truck details:', error);
  //       this.loading = false;
  //     },
  //   });
  // }

  private createForms(): void {
    this.fuelRefillForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(0)]],
      cost: ['', [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      odometerReading: ['', [Validators.required, Validators.min(0)]],
      fuelType: ['diesel', Validators.required],
    });

    this.maintenanceForm = this.fb.group({
      date: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]],
      technicianName: ['', Validators.required],
    });
  }

  getMaintenanceStatusClass(status: MaintenanceStatus): string {
    const statusClasses: Record<MaintenanceStatus, string> = {
      completed: 'bg-green-100 text-green-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
    };
    return statusClasses[status];
  }

  // private loadMaintenanceHistory(
  //   truckId: number
  // ): Observable<MaintenanceRecord[]> {
  //   // Add this method to TransportService
  //   return this.transportService.getTruckMaintenanceHistory(truckId);
  // }

  // private loadFuelHistory(truckId: number): Observable<FuelRecord[]> {
  //   // Add this method to TransportService
  //   return this.transportService.getTruckFuelHistory(truckId);
  // }

  // private loadTruckAnalytics(truckId: number): Observable<TruckAnalytics> {
  //   // Add this method to TransportService
  //   return this.transportService.getTruckAnalytics(truckId);
  // }

  private processAnalytics(data: TruckAnalytics): void {
    this.fuelEfficiencyTrend = data.fuelEfficiency;
    this.maintenanceCostTrend = data.maintenanceCosts;
    this.utilizationRate = data.utilization;

    // Calculate performance metrics
    this.calculatePerformanceMetrics();
  }

  private calculatePerformanceMetrics(): void {
    if (this.fuelHistory.length === 0) return;

    // Calculate average fuel consumption (L/100km)
    this.averageFuelConsumption =
      this.fuelHistory.reduce((acc, curr) => {
        return acc + curr.quantity / (curr.odometerReading * 100);
      }, 0) / this.fuelHistory.length;

    // Calculate total maintenance cost
    this.totalMaintenanceCost = this.maintenanceHistory.reduce((acc, curr) => {
      return acc + curr.cost;
    }, 0);

    // Calculate total distance covered
    const latestRecord = this.fuelHistory[this.fuelHistory.length - 1];
    const firstRecord = this.fuelHistory[0];
    if (latestRecord && firstRecord) {
      this.totalDistanceCovered =
        latestRecord.odometerReading - firstRecord.odometerReading;
    }

    // Calculate uptime percentage
    const totalDays = this.calculateTotalDays();
    const maintenanceDays = this.calculateMaintenanceDays();
    if (totalDays > 0) {
      this.uptime = ((totalDays - maintenanceDays) / totalDays) * 100;
    }
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
      .filter((record) => record.status === 'completed')
      .reduce((total, _record) => total + 1, 0); // Assuming 1 day per maintenance
  }

  scheduleMaintenance(): void {
    // Implement maintenance scheduling logic
  }

  recordFuelRefill(): void {
    this.showFuelRefillModal = true;
  }

  // submitFuelRefill(): void {
  //   if (this.fuelRefillForm.valid && this.truck.id) {
  //     const refillData: FuelRefill = {
  //       ...this.fuelRefillForm.value,
  //       date: new Date().toISOString(),
  //     };

  //     this.transportService
  //       .recordFuelRefill(this.truck.id, refillData)
  //       .subscribe({
  //         next: () => {
  //           this.showFuelRefillModal = false;
  //           this.fuelRefillForm.reset({
  //             fuelType: 'diesel',
  //           });
  //           this.loadTruckDetails(this.truck.id!);
  //         },
  //         error: (error) => {
  //           console.error('Error recording fuel refill:', error);
  //         },
  //       });
  //   }
  // }

  exportMaintenanceHistory(format: 'excel' | 'pdf'): void {
    // Implement export functionality
  }

  getNextMaintenanceDate(): Date | undefined {
    const scheduledMaintenance = this.maintenanceHistory.find(
      (m) => m.status === 'scheduled'
    );
    return scheduledMaintenance
      ? new Date(scheduledMaintenance.date)
      : undefined;
  }

  getDaysUntilMaintenance(): number | undefined {
    const nextDate = this.getNextMaintenanceDate();
    if (!nextDate) return undefined;

    const today = new Date();
    return Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}
