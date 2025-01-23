import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransportService, Transport, Driver } from '../../../services/transport.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

type TransportStatus = 'scheduled' | 'in-transit' | 'completed' | 'cancelled';

@Component({
  selector: 'app-transport-list',
  templateUrl: './transportlist.component.html',
  styleUrls: ['./transportlist.component.css']
})
export class TransportListComponent implements OnInit {
  transports: Transport[] = [];
  drivers: Driver[] = [];
  selectedTransports: Set<number> = new Set();
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  
  Math = Math;

  filterForm!: FormGroup;
  exportLoading = false;

  statusOptions: TransportStatus[] = ['scheduled', 'in-transit', 'completed', 'cancelled'];

  constructor(
    private transportService: TransportService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadTransports();
    this.loadDrivers();
    this.setupFilterSubscription();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      status: [''],
      startLocation: [''],
      endLocation: [''],
      driverId: [''],
      truckId: ['']
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
        this.loadTransports();
      });
  }

  loadTransports(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.transportService.getTransports(params).subscribe({
      next: (response) => {
        this.transports = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transports:', error);
        this.loading = false;
      }
    });
  }

  loadDrivers(): void {
    this.transportService.getDrivers().subscribe({
      next: (response) => {
        this.drivers = response.drivers;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
      }
    });
  }

  toggleSelection(transportId: number | undefined): void {
    if (!transportId) return;
    
    if (this.selectedTransports.has(transportId)) {
      this.selectedTransports.delete(transportId);
    } else {
      this.selectedTransports.add(transportId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedTransports.size === this.transports.length) {
      this.selectedTransports.clear();
    } else {
      this.transports.forEach(transport => {
        if (transport.id) {
          this.selectedTransports.add(transport.id);
        }
      });
    }
  }

  optimizeSelectedRoutes(): void {
    if (this.selectedTransports.size === 0) return;
    
    const waypoints = this.transports
      .filter(t => t.id && this.selectedTransports.has(t.id))
      .map(t => [t.startLocation, t.endLocation])
      .flat();

    this.transportService.optimizeRoute(waypoints).subscribe({
      next: (optimizedRoute) => {
        // Handle optimized route
        console.log('Route optimized:', optimizedRoute);
      }
    });
  }

  exportSelected(format: 'excel' | 'pdf'): void {
    if (this.selectedTransports.size === 0) return;
    
    this.exportLoading = true;
    this.transportService.exportTransportData(
      format,
      { ids: Array.from(this.selectedTransports).join(',') }
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transport-data.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.exportLoading = false;
      },
      error: (error) => {
        console.error('Error exporting transport data:', error);
        this.exportLoading = false;
      }
    });
  }

  updateTransportStatus(id: number | undefined, status: TransportStatus): void {
    if (!id) return;
    
    this.transportService.updateTransport(id, { status }).subscribe({
      next: () => {
        this.loadTransports();
      }
    });
  }

  getStatusClass(status: TransportStatus): string {
    const statusClasses: Record<TransportStatus, string> = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status];
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransports();
  }

  calculateTotalDistance(): number {
    return this.transports
      .filter(t => t.id && this.selectedTransports.has(t.id))
      .reduce((sum, t) => sum + (t.distance || 0), 0);
  }

  getFuelEfficiency(): number {
    const selectedTransports = this.transports
      .filter(t => t.id && this.selectedTransports.has(t.id));
    
    if (selectedTransports.length === 0) return 0;

    const totalFuel = selectedTransports
      .reduce((sum, t) => sum + (t.fuelConsumption || 0), 0);
    const totalDistance = this.calculateTotalDistance();

    return totalDistance > 0 ? totalFuel / totalDistance : 0;
  }
}