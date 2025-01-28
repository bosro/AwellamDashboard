// src/app/components/driver-form/driver-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../../../services/driver.service';
import { TruckService } from '../../../../services/truck.service';
import { Driver } from '../../../../shared/types/driver-types';
import { Truck } from '../../../../shared/types/truck-operation.types';

@Component({
  selector: 'app-driver-form',
  templateUrl: './driver-form.component.html'
})
export class DriverFormComponent implements OnInit {
  driverForm!: FormGroup;
  isEditMode = false;
  loading = false;
  driverId: string = '';
  availableTrucks: Truck[] = [];

  constructor(
    private fb: FormBuilder,
    private driverService: DriverService,
    private truckService: TruckService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.driverId = this.route.snapshot.params['id'];
    if (this.driverId) {
      this.isEditMode = true;
      this.loadDriver();
    }
    this.loadAvailableTrucks();
  }

  private createForm(): void {
    this.driverForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      truckId: ['']
    });
  }

  private loadDriver(): void {
    this.loading = true;
    this.driverService.getDriverById(this.driverId).subscribe({
      next: (response) => {
        const driver = response.driver;
        this.driverForm.patchValue({
          name: driver.name,
          phoneNumber: driver.phoneNumber,
          licenseNumber: driver.licenseNumber,
          truckId: driver.truck?._id || ''
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading driver:', error);
        this.loading = false;
      }
    });
  }

  private loadAvailableTrucks(): void {
    this.truckService.getTrucks().subscribe({
      next: (response) => {
        this.availableTrucks = response.trucks.filter(
          (truck: Truck) => !truck.driver || truck.driver._id === this.driverId
        );
      },
      error: (error) => console.error('Error loading trucks:', error)
    });
  }

  onSubmit(): void {
    if (this.driverForm.invalid) return 
      this.loading = true;
      const formData = this.driverForm.value;

      const request = this.isEditMode
        ? this.driverService.updateDriver(this.driverId, formData)
        : this.driverService.createDriver(formData);

      request.subscribe({
        next: () => {
          this.router.navigate(['main/transport/drivers']);
        },
        error: (error) => {
          console.error('Error saving driver:', error);
          this.loading = false;
        }
      });
    }
  
}