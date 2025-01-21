import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransportService, Truck } from '../../../services/transport.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

type TruckStatus = 'available' | 'in-use' | 'maintenance';
type MaintenanceStatus = 'overdue' | 'due-soon' | 'ok';
type FuelStatus = 'low' | 'medium' | 'good';

@Component({
  selector: 'app-truck-management',
  templateUrl: './truck-management.component.html',
  styleUrls: ['./truck-management.component.scss']
})
export class TruckManagementComponent implements OnInit {
  trucks: Truck[] = [];
  selectedTrucks: Set<number> = new Set();
  loading = false;
  showMaintenanceModal = false;
  maintenanceForm!: FormGroup;
  filterForm!: FormGroup;
  currentPage = 1;
  pageSize = 10;
  total = 0;

  Math = Math; // Add this to use Math in template
 
  maintenanceTypes = [
    'Regular Service',
    'Oil Change',
    'Tire Replacement',
    'Brake Service',
    'Major Repair'
  ];

  constructor(
    private transportService: TransportService,
    private fb: FormBuilder
  ) {
    this.createForms();
  }

  ngOnInit(): void {
    this.loadTrucks();
    this.setupFilterSubscription();
  }

  private createForms(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: [''],
      location: [''],
      maintenanceStatus: ['']
    });

    this.maintenanceForm = this.fb.group({
      maintenanceDate: [''],
      maintenanceType: [''],
      notes: ['']
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTrucks();
      });
  }

  loadTrucks(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.transportService.getTrucks(params).subscribe({
      next: (response) => {
        this.trucks = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      }
    });
  }

  toggleSelection(truckId: number): void {
    if (this.selectedTrucks.has(truckId)) {
      this.selectedTrucks.delete(truckId);
    } else {
      this.selectedTrucks.add(truckId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedTrucks.size === this.trucks.length) {
      this.selectedTrucks.clear();
    } else {
      this.trucks.forEach(truck => {
        if (truck.id) {
          this.selectedTrucks.add(truck.id);
        }
      });
    }
  }

  updateTruckStatus(truckId: number, status: TruckStatus): void {
    this.transportService.updateTruckStatus(truckId, status).subscribe({
      next: () => {
        this.loadTrucks();
      }
    });
  }

  

  getMaintenanceStatus(truck: Truck): MaintenanceStatus {
    const today = new Date();
    const nextMaintenance = new Date(truck.nextMaintenanceDate);
    const daysUntilMaintenance = Math.floor((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilMaintenance < 0) {
      return 'overdue';
    } else if (daysUntilMaintenance <= 7) {
      return 'due-soon';
    }
    return 'ok';
  }

  getFuelStatus(truck: Truck): FuelStatus {
    const fuelPercentage = (truck.currentFuelLevel / truck.fuelCapacity) * 100;
    if (fuelPercentage <= 20) {
      return 'low';
    } else if (fuelPercentage <= 40) {
      return 'medium';
    }
    return 'good';
  }

  getStatusClass(status: TruckStatus): string {
    const classes: Record<TruckStatus, string> = {
      'available': 'bg-green-100 text-green-800',
      'in-use': 'bg-blue-100 text-blue-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || '';
  }

  getMaintenanceStatusClass(status: MaintenanceStatus): string {
    const classes: Record<MaintenanceStatus, string> = {
      'overdue': 'bg-red-100 text-red-800',
      'due-soon': 'bg-yellow-100 text-yellow-800',
      'ok': 'bg-green-100 text-green-800'
    };
    return classes[status] || '';
  }

  getFuelStatusClass(status: FuelStatus): string {
    const classes: Record<FuelStatus, string> = {
      'low': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'good': 'bg-green-100 text-green-800'
    };
    return classes[status] || '';
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  exportTruckData(format: 'excel' | 'pdf'): void {
    const selectedIds = Array.from(this.selectedTrucks);
    // Implement export functionality
  }



  getOperationalCount(): number {
    return this.trucks.filter(truck => truck.status === 'in-use').length;
  }

  getMaintenanceCount(): number {
    return this.trucks.filter(truck => truck.status === 'maintenance').length;
  }

  getMaintenanceDueCount(): number {
    const today = new Date();
    return this.trucks.filter(truck => {
      const nextMaintenance = new Date(truck.nextMaintenanceDate);
      const daysUntil = Math.floor((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    }).length;
  }

  getLowFuelCount(): number {
    return this.trucks.filter(truck => {
      const fuelPercentage = (truck.currentFuelLevel / truck.fuelCapacity) * 100;
      return fuelPercentage <= 20;
    }).length;
  }

  getAverageMileage(): number {
    if (this.trucks.length === 0) return 0;
    const totalMileage = this.trucks.reduce((sum, truck) => sum + truck.mileage, 0);
    return Math.round(totalMileage / this.trucks.length);
  }

  getFleetUtilization(): number {
    if (this.trucks.length === 0) return 0;
    const operationalCount = this.getOperationalCount();
    return Math.round((operationalCount / this.trucks.length) * 100);
  }

  scheduleMaintenance(truckId?: number): void {
    if (this.maintenanceForm.valid) {
      const { maintenanceDate, maintenanceType, notes } = this.maintenanceForm.value;
      
      // If truckId is not provided, schedule for all selected trucks
      const trucksToSchedule = truckId ? [truckId] : Array.from(this.selectedTrucks);
      
      // Create an array of observables for each truck
      const maintenanceRequests = trucksToSchedule.map(id =>
        this.transportService.scheduleMaintenance(id, maintenanceDate)
      );

      // Execute all requests
      forkJoin(maintenanceRequests).subscribe({
        next: () => {
          this.showMaintenanceModal = false;
          this.maintenanceForm.reset();
          this.loadTrucks();
        },
        error: (error) => {
          console.error('Error scheduling maintenance:', error);
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTrucks();
  }
}