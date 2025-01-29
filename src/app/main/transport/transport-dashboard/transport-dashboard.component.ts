import { Component, OnInit } from '@angular/core';
import { TransportService } from '../../../services/transaport.service'

interface DashboardMetrics {
  activeTrucks: number;
  activeDrivers: number;
  totalRevenue: string;
  totalDeliveries: number;
  averageDeliveryTime: number;
  deliveryStatusCounts: DeliveryStatusCount[];
}

interface DeliveryStatusCount {
  count: number;
  status: string;
}

@Component({
  selector: 'app-transport-dashboard',
  templateUrl: './transport-dashboard.component.html',
  styleUrls: ['./transport-dashboard.component.scss']
})
export class TransportDashboardComponent implements OnInit {
  metrics!: DashboardMetrics;
  loading = false;

  constructor(private transportService: TransportService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    this.transportService.getTransportDashboardData().subscribe({
      next: (response) => {
        this.metrics = response.dashboardData;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }
}