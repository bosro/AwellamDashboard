import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransportService, Truck } from '../../services/transport.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  maintenanceForm: FormGroup;
  filterForm: FormGroup;
  currentPage = 1;
  pageSize = 10;
  total = 0;

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
        this.selectedTrucks.add(truck.id);
      });
    }
  }

  updateTruckStatus(truckId: number, status: string): void {
    this.transportService.updateTruckStatus(truckId, status).subscribe({
      next: () => {
        this.loadTrucks();
      }
    });
  }

  scheduleMaintenance(truckId: number): void {
    if (this.maintenanceForm.valid) {
      const { maintenanceDate, maintenanceType, notes } = this.maintenanceForm.value;
      
      this.transportService.scheduleMaintenance(truckId, maintenanceDate).subscribe({
        next: () => {
          this.showMaintenanceModal = false;
          this.maintenanceForm.reset();
          this.loadTrucks();
        }
      });
    }
  }

  getMaintenanceStatus(truck: Truck): string {
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

  getFuelStatus(truck: Truck): string {
    const fuelPercentage = (truck.currentFuelLevel / truck.fuelCapacity) * 100;
    if (fuelPercentage <= 20) {
      return 'low';
    } else if (fuelPercentage <= 40) {
      return 'medium';
    }
    return 'good';
  }

  getStatusClass(status: string): string {
    const classes = {
      'available': 'bg-green-100 text-green-800',
      'in-use': 'bg-blue-100 text-blue-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || '';
  }

  getMaintenanceStatusClass(status: string): string {
    const classes = {
      'overdue': 'bg-red-100 text-red-800',
      'due-soon': 'bg-yellow-100 text-yellow-800',
      'ok': 'bg-green-100 text-green-800'
    };
    return classes[status] || '';
  }

  getFuelStatusClass(status: string): string {
    const classes = {
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTrucks();
  }
}