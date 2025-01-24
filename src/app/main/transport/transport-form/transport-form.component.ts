import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportService, Transport, Driver, Truck } from '../../../services/driver.service';
import { combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-transport-form',
  templateUrl: './transport-form.component.html',
  styleUrls: ['./transport-form.component.scss']
})
export class TransportFormComponent implements OnInit {
  transportForm!: FormGroup;
  isEditMode = false;
  loading = false;
  transportId!: number;

  availableDrivers: Driver[] = [];
  availableTrucks: Truck[] = [];
  estimatedDistance: number = 0;
  estimatedDuration: number = 0;

  constructor(
    private fb: FormBuilder,
    private transportService: TransportService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.transportId = this.route.snapshot.params['id'];
    if (this.transportId) {
      this.isEditMode = true;
    }
    this.setupRouteCalculation();
    this.loadAvailableResources();
  }

  private createForm(): void {
    this.transportForm = this.fb.group({
      startLocation: ['', Validators.required],
      endLocation: ['', Validators.required],
      startTime: ['', Validators.required],
      estimatedEndTime: [''],
      driverId: ['', Validators.required],
      truckId: ['', Validators.required],
      loadCapacity: [0, [Validators.required, Validators.min(0)]],
      currentLoad: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
      status: ['scheduled']
    });
  }

  private setupRouteCalculation(): void {
    combineLatest([
      this.transportForm.get('startLocation')!.valueChanges,
      this.transportForm.get('endLocation')!.valueChanges
    ]).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(([start, end]) => {
        if (start && end) {
          // Here you would typically call a route optimization service
          // For demo, using a simple simulation
          return this.simulateRouteCalculation(start, end);
        }
        return Promise.resolve({ distance: 0, duration: 0 });
      })
    ).subscribe(result => {
      this.estimatedDistance = result.distance;
      this.estimatedDuration = result.duration;
      this.updateEstimatedEndTime();
    });
  }

  private simulateRouteCalculation(start: string, end: string): Promise<any> {
    // Simulate API call for route calculation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          distance: Math.floor(Math.random() * 100) + 50,
          duration: Math.floor(Math.random() * 120) + 30
        });
      }, 500);
    });
  }

  private updateEstimatedEndTime(): void {
    const startTime = this.transportForm.get('startTime')!.value;
    if (startTime && this.estimatedDuration) {
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + this.estimatedDuration);
      this.transportForm.patchValue({
        estimatedEndTime: endTime.toISOString().slice(0, 16)
      });
    }
  }

  private loadAvailableResources(): void {
    // this.transportService.getDrivers({ status: 'available' }).subscribe({
    //   next: (response) => {
    //     this.availableDrivers = response.data;
    //   }
    // });

    // this.transportService.getTrucks({ status: 'available' }).subscribe({
    //   next: (response) => {
    //     this.availableTrucks = response.data;
    //   }
    // });
  }

  // private loadTransport(): void {
  //   this.loading = true;
  //   this.transportService.getTransportById(this.transportId).subscribe({
  //     next: (transport) => {
  //       this.transportForm.patchValue({
  //         ...transport,
  //         startTime: new Date(transport.startTime).toISOString().slice(0, 16),
  //         estimatedEndTime: new Date(transport.estimatedEndTime).toISOString().slice(0, 16)
  //       });
  //       this.estimatedDistance = transport.distance;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading transport:', error);
  //       this.loading = false;
  //     }
  //   });
  // }

  onDriverSelect(driverId:any): void {
    const driver = this.availableDrivers.find(d => d._id === driverId);
    if (driver && driver.status !== 'available') {
      this.transportForm.get('driverId')!.setErrors({ 'driverUnavailable': true });
    }
  }

  onTruckSelect(truckId:any): void {
    const truck = this.availableTrucks.find(t => t._id === truckId);
    if (truck) {
      this.transportForm.patchValue({
        loadCapacity: truck.capacity
      });
    }
  }

  validateLoad(): boolean {
    const currentLoad = this.transportForm.get('currentLoad')!.value;
    const loadCapacity = this.transportForm.get('loadCapacity')!.value;
    return currentLoad <= loadCapacity;
  }

  onSubmit(): void {
    if (this.transportForm.valid && this.validateLoad()) {
      this.loading = true;
      const formData = {
        ...this.transportForm.value,
        distance: this.estimatedDistance
      };

  //     const request = this.isEditMode
  //       ? this.transportService.updateTransport(this.transportId, formData)
  //       : this.transportService.createTransport(formData);

  //     request.subscribe({
  //       next: () => {
  //         this.router.navigate(['/transport/trips']);
  //       },
  //       error: (error) => {
  //         console.error('Error saving transport:', error);
  //         this.loading = false;
  //       }
  //     });
  //   } else {
  //     Object.keys(this.transportForm.controls).forEach(key => {
  //       const control = this.transportForm.get(key);
  //       if (control!.invalid) {
  //         control!.markAsTouched();
  //       }
  //     });
  //   }
  }
}
}