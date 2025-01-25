import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TruckService } from '../../../services/truck.service';
import { Truck } from '../../../shared/types/truck-operation.types';
@Component({
  selector: 'app-truck-management',
  templateUrl: './truck-management.component.html'
})
export class TruckManagementComponent implements OnInit {
  trucks: Truck[] = [];
  selectedTrucks: Set<string> = new Set();
  loading = false;
  filterForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private truckService: TruckService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createFilterForm();
    this.loadTrucks();
    this.filterForm.valueChanges.subscribe(() => {
      this.loadTrucks();
    });
  }

  createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: ['']
    });
  }

  loadTrucks(): void {
    this.loading = true;
    const params = this.filterForm.value;
    this.truckService.getTrucks(params).subscribe({
      next: (response) => {
        this.trucks = response.trucks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      }
    });
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

  
}