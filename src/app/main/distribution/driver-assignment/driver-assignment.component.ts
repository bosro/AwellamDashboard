import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DistributionService, Driver, Truck, Distribution, DistributionUpdate } from '../../../services/distribution.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-driver-assignment',
  templateUrl: './driver-assignment.component.html'
})
export class DriverAssignmentComponent implements OnInit {
  assignmentForm!: FormGroup;
  loading = false;
  selectedOrders: Distribution[] = [];
  availableDrivers: Driver[] = [];
  availableTrucks: Truck[] = [];

  constructor(
    private fb: FormBuilder,
    private distributionService: DistributionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const orderParam = this.route.snapshot.queryParams['orders'];
    if (orderParam) {
      const orderIds = orderParam.split(',').filter((id: string): id is string => !!id);
      if (orderIds.length) {
        this.loadOrders(orderIds);
      }
    }
    this.loadAvailableResources();
  }

  private createForm(): void {
    this.assignmentForm = this.fb.group({
      driverId: ['', Validators.required],
      truckId: ['', Validators.required],
      notes: ['']
    });
  }

  private loadOrders(orderIds: string[]): void {
    this.loading = true;
    const requests = orderIds.map(id => 
      this.distributionService.getDistributionById(parseInt(id, 10))
    );

    forkJoin(requests).subscribe({
      next: (orders) => {
        this.selectedOrders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  private loadAvailableResources(): void {
    forkJoin({
      drivers: this.distributionService.getAvailableDrivers(),
      trucks: this.distributionService.getAvailableTrucks(this.selectedOrders[0]?.plant)
    }).subscribe({
      next: (resources) => {
        this.availableDrivers = resources.drivers;
        this.availableTrucks = resources.trucks;
      }
    });
  }

  onSubmit(): void {
    if (this.assignmentForm.valid) {
      this.loading = true;
      const { driverId, truckId, notes } = this.assignmentForm.value;
      
      // Create update requests for all selected orders
      const updateRequests = this.selectedOrders.map(order => {
        const update: DistributionUpdate = {
          driverId,
          truckId,
          notes: notes 
            ? `${order.notes || ''}\nDriver Assignment Note: ${notes}`
            : undefined, // Use undefined instead of null
          status: 'pending'
        };
        return this.distributionService.updateDistribution(order.id, update);
      });

      // Update driver and truck status
      const driverUpdate = this.distributionService.updateDriverStatus(driverId, 'on-delivery');
      const truckUpdate = this.distributionService.updateTruckStatus(truckId, 'in-use');

      forkJoin([...updateRequests, driverUpdate, truckUpdate]).subscribe({
        next: () => {
          this.router.navigate(['/distribution']);
        },
        error: (error) => {
          console.error('Error assigning resources:', error);
          this.loading = false;
        }
      });
    }
  }

  getTotalQuantity(): number {
    return this.selectedOrders.reduce((sum, order) => sum + order.quantity, 0);
  }

  getDeliveryLocations(): string[] {
    return [...new Set(this.selectedOrders
      .map(order => order.deliveryAddress)
      .filter((address): address is string => !!address))];
  }
}