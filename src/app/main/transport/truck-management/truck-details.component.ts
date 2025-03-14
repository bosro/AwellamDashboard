import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TruckService } from '../../../services/truck.service';
import Swal from 'sweetalert2';

interface Product {
  _id: string;
  name: string;
}

interface Plant {
  _id: string;
  name: string;
}

interface Destination {
  _id: string;
  destination: string;
}

interface Driver {
  _id: string;
  name: string;
}

interface SocNumber {
  _id: string;
  socNumber: string;
  quantity: number;
  totalquantity: number;
  plantId: Plant;
  categoryId?: { _id: string; name: string };
  productId: Product;
  destinationId?: string;
  orderType?: string;
  status: string;
  borrowedOrder: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTruck?: string;
}

interface Truck {
  _id: string;
  truckNumber: string;
  capacity: number;
  expenses: number;
  loadedbags?: number;
  status: string;
  productId: Product | null;
  orderId: string | null;
  plantId: Plant | null;
  categoryId?: { _id: string; name: string } | null;
  socNumber: SocNumber | null;
  socNumbers?: SocNumber[];
  LoadStatus: string;
  isAwellamLoad: boolean;
  amountReceived: number;
  customerName?: string;
  destinationId?: Destination;
  driver?: Driver;
  deliveredOrders?: string[];
  expenditure?: any[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-truck-detail',
  templateUrl: './truck-detail.component.html'
})
export class TruckDetailComponent implements OnInit {
  loading = true;
  truck!: Truck;

  constructor(
    private route: ActivatedRoute,
    private truckService: TruckService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const truckId = this.route.snapshot.paramMap.get('id');
    if (truckId) {
      this.loadTruckDetails(truckId);
    }
  }

  loadTruckDetails(truckId: string): void {
    this.truckService.getTruckById(truckId).subscribe({
      next: (response) => {
        this.truck = response.truck;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading truck details:', error);
        this.loading = false;
        Swal.fire('Error', 'Failed to load truck details', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/main/transport/trucks/']);
  }

  unloadTruck(truckId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will unload the truck. Proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, unload it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        
        const endpoint = this.truck?.isAwellamLoad 
          ? `${truckId}`
          : `outside/${truckId}`;

        this.truckService.unloadTruck(endpoint).subscribe({
          next: () => {
            Swal.fire('Success', 'Truck unloaded successfully', 'success');
            this.loadTruckDetails(truckId);
          },
          error: (error) => {
            this.loading = false;
            Swal.fire('Error', error.error?.message || 'Failed to unload truck', 'error');
          }
        });
      }
    });
  }
}