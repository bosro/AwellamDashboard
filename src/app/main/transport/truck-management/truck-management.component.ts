import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TruckService } from '../../../services/truck.service';
import { Truck } from '../../../shared/types/truck-operation.types';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-truck-management',
  templateUrl: './truck-management.component.html'
})
export class TruckManagementComponent implements OnInit {
  trucks: Truck[] = [];
  filteredTrucks: Truck[] = [];
  selectedTrucks: Set<string> = new Set();
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  filterForm!: FormGroup;

  Math= Math

  constructor(
    private fb: FormBuilder,
    private truckService: TruckService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createFilterForm();
    this.loadTrucks();
    this.setupFilterSubscription();
  }

  createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: ['']
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
        this.applyFilters();
      });
  }

  loadTrucks(): void {
    this.loading = true;
    this.truckService.getTrucks().subscribe({
      next: (response) => {
        this.trucks = response.trucks;
        this.total = this.trucks.length;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const { searchTerm, status } = this.filterForm.value;

    this.filteredTrucks = this.trucks.filter(truck => {
      const matchesSearch = !searchTerm || truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !status || truck.status === status;

      return matchesSearch && matchesStatus;
    });

    this.total = this.filteredTrucks.length;
    this.filteredTrucks = this.filteredTrucks.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  updateTruckStatus(truckId: string, status: Truck['status']): void {
    this.truckService.updateTruck(truckId, { status }).subscribe({
      next: () => this.loadTrucks(),
      error: (error) => console.error('Error updating truck status:', error)
    });
  }

  getOperationalCount(): number {
    return this.trucks.filter(truck => truck.status === 'active').length;
  }

  getMaintenanceCount(): number {
    return this.trucks.filter(truck => truck.status === 'maintenance').length;
  }

  getStatusClass(status: Truck['status']): string {
    const classes: Record<Truck['status'], string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || '';
  }

  viewTruckDetails(id: string): void {
    this.router.navigate(['main/transport/trucks/details/', id]);
  }

  addTruck(): void {
    this.router.navigate(['main/transport/trucks/new/']);
  }

  loadTruck(): void {
    this.router.navigate(['main/transport/trucks/load']);
  }

  deleteTruck(id: string): void {
    if (confirm('Are you sure you want to delete this truck?')) {
      this.truckService.deleteTruck(id).subscribe({
        next: () => this.loadTrucks(),
        error: (error) => console.error('Error deleting truck:', error)
      });
    }
  }
}