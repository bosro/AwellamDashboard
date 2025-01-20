import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DistributionService, Distribution } from '../../../services/distribution.service';

// Define the status type
type DistributionStatus = 'pending' | 'in-transit' | 'delivered' | 'cancelled';

interface DeliveryStep {
  title: string;
  description: string;
  timestamp: string | null;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

interface StatusClasses {
  pending: string;
  'in-transit': string;
  delivered: string;
  cancelled: string;
}

@Component({
  selector: 'app-distribution-details',
  templateUrl: './distribution-details.component.html',
  styleUrls: ['./distribution-details.component.scss']
})
export class DistributionDetailsComponent implements OnInit {
  order!: Distribution;
  loading = false;
  deliverySteps: DeliveryStep[] = [];
  
  private readonly statusClasses: StatusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  constructor(
    private distributionService: DistributionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadOrderDetails(id);
  }

  loadOrderDetails(id: number): void {
    this.loading = true;
    this.distributionService.getDistributionById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.generateDeliverySteps();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.loading = false;
      }
    });
  }

  generateDeliverySteps(): void {
    this.deliverySteps = [
      {
        title: 'Order Created',
        description: 'Distribution order has been created in the system',
        timestamp: this.order.date || null,
        status: 'completed',
        icon: 'ri-file-list-3-line'
      },
      {
        title: 'Driver Assigned',
        description: this.order.driverName ? 
          `Assigned to ${this.order.driverName}` : 
          'Awaiting driver assignment',
        timestamp: this.order.driverAssignedAt,
        status: this.order.driverName ? 'completed' : 'pending',
        icon: 'ri-user-line'
      },
      {
        title: 'In Transit',
        description: 'Order is being delivered to the destination',
        timestamp: this.order.transitStartTime,
        status: this.order.status === 'in-transit' ? 'current' : 
               this.order.status === 'delivered' ? 'completed' : 'pending',
        icon: 'ri-truck-line'
      },
      {
        title: 'Delivered',
        description: this.order.status === 'delivered' ? 
          'Successfully delivered to customer' : 
          'Awaiting delivery confirmation',
        timestamp: this.order.actualDeliveryTime,
        status: this.order.status === 'delivered' ? 'completed' : 'pending',
        icon: 'ri-check-double-line'
      }
    ];
  }

  updateStatus(status: DistributionStatus): void {
    this.distributionService.updateDistribution(
      this.order.id,
      { status }
    ).subscribe({
      next: (updated) => {
        this.order = updated;
        this.generateDeliverySteps();
      }
    });
  }

  getStatusClass(status: DistributionStatus): string {
    return this.statusClasses[status] || '';
  }
}