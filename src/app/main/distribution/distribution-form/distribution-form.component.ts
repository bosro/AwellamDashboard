import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DistributionService, Distribution, Driver, Truck } from '../../../services/distribution.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-distribution-form',
  templateUrl: './distribution-form.component.html',
  styleUrls: ['./distribution-form.component.scss']
})
export class DistributionFormComponent implements OnInit {
  distributionForm!: FormGroup;
  isEditMode = false;
  loading = false;
  orderId!: number;
  
  availableDrivers: Driver[] = [];
  availableTrucks: Truck[] = [];
  productTypes = ['42.5R', '32.5N'];
  plants = ['Plant A', 'Plant B'];

  constructor(
    private fb: FormBuilder,
    private distributionService: DistributionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['id'];
    if (this.orderId) {
      this.isEditMode = true;
      this.loadOrder();
    }
    this.setupPlantSubscription();
  }

  private createForm(): void {
    this.distributionForm = this.fb.group({
      customerName: ['', [Validators.required]],
      productType: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      plant: ['', [Validators.required]],
      deliveryAddress: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]+$/)]],
      driverId: [''],
      truckId: [''],
      estimatedDeliveryTime: ['', [Validators.required]],
      notes: [''],
      status: ['pending']
    });
  }

  private setupPlantSubscription(): void {
    this.distributionForm.get('plant')!.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(plant => {
          if (!plant) return of([]);
          return this.distributionService.getAvailableTrucks(plant);
        })
      )
      .subscribe(trucks => {
        this.availableTrucks = trucks;
        if (this.distributionForm.get('truckId')!.value) {
          const truckExists = trucks.some(t => t.id === this.distributionForm.get('truckId')!.value);
          if (!truckExists) {
            this.distributionForm.patchValue({ truckId: '' });
          }
        }
      });

    // Load available drivers
    this.distributionService.getAvailableDrivers().subscribe(drivers => {
      this.availableDrivers = drivers;
    });
  }

  private loadOrder(): void {
    this.loading = true;
    this.distributionService.getDistributionById(this.orderId).subscribe({
      next: (order) => {
        this.distributionForm.patchValue(order);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading distribution order:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.distributionForm.valid) {
      this.loading = true;
      const order = this.distributionForm.value;
      
      // Calculate total amount
      order.totalAmount = order.quantity * order.price;

      const request = this.isEditMode
        ? this.distributionService.updateDistribution(this.orderId, order)
        : this.distributionService.createDistribution(order);

      request.subscribe({
        next: () => {
          // Update driver and truck status if assigned
          if (order.driverId) {
            this.distributionService.updateDriverStatus(order.driverId, 'on-delivery').subscribe();
          }
          if (order.truckId) {
            this.distributionService.updateTruckStatus(order.truckId, 'in-use').subscribe();
          }
          this.router.navigate(['/distribution']);
        },
        error: (error) => {
          console.error('Error saving distribution order:', error);
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.distributionForm.controls).forEach(key => {
        const control = this.distributionForm.get(key);
        if (control!.invalid) {
          control!.markAsTouched();
        }
      });
    }
  }

  calculateTotalAmount(): number {
    const quantity = this.distributionForm.get('quantity')!.value || 0;
    const price = this.distributionForm.get('price')!.value || 0;
    return quantity * price;
  }
}