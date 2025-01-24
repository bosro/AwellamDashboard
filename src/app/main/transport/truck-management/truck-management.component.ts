import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
// import {transportService} from '../../../services/transport.service'
import { Truck } from '../../../services/driver.service';


// Use the previously defined Truck interface
import {TruckResponse } from '../../../shared/types/truck-operation.types';
import { TransportService } from '../../../services/driver.service';

@Component({
  selector: 'app-truck-management',
  templateUrl: './truck-management.component.html',
  styleUrls: ['./truck-management.component.scss']
})
export class TruckManagementComponent implements OnInit {
  trucks: Truck[] =[];
  selectedTrucks: Set<string> = new Set(); // Changed to use _id
  loading = false;
  filterForm!: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private transportService: TransportService ,
    private router: Router // Inject TransportService
  ) {}
  ngOnInit(): void {
    this.createFilterForm();
    this.loadTrucks();
  }

  createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: ['']
    });
  }


  viewDetails(truckId: string): void {
    this.router.navigate(['/trips/:id', truckId]);
  }

  loadTrucks(): void {
    this.loading = true;
    const params = this.filterForm.value; // Use filter form values as params
    this.transportService.getTrucks(params).subscribe({
      next: (response) => {
        this.trucks = response.trucks;
        this.loading = false;
        console.log(this.trucks)
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      }
    });
  }
  // Modify methods to use _id
  toggleSelection(truckId: string): void {
    if (this.selectedTrucks.has(truckId)) {
      this.selectedTrucks.delete(truckId);
    } else {
      this.selectedTrucks.add(truckId);
    }
  }

  // Update status method
  updateTruckStatus(truckId: string, status: Truck['status']): void {
    // Implement API call to update truck status
    console.log(`Updating truck ${truckId} to status ${status}`);
  }

  // Utility methods
  getOperationalCount(): number {
    return this.trucks.filter(truck => truck.status === 'active').length;
  }

  getMaintenanceCount(): number {
    return this.trucks.filter(truck => truck.status === 'maintenance').length;
  }

  // Status and styling methods remain similar to previous implementation
  getStatusClass(status: Truck['status']): string {
    const classes: Record<Truck['status'], string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || '';
  }
}