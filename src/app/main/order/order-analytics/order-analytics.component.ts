import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdersService } from '../../../services/order.service';


interface DeliveryStatusCount {
  count: number;
  status: string;
}


@Component({
  selector: 'app-order-analytics',
  templateUrl: './order-analytics.component.html'
})
export class OrderAnalyticsComponent implements OnInit {
  loading = false;
  filterForm: FormGroup;
  
  Math = Math; // Make Math available in template
  
  // Growth metrics
  orderGrowth = 0;
  revenueGrowth = 0;

  // Chart color scheme
  colorScheme = {
    domain: ['#60A5FA', '#34D399', '#F87171', '#FCD34D', '#818CF8', '#9CA3AF']
  };
  
  // Analytics Data
  summary = {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    totalRepeatCustomers: 0,
    deliveryStatusCounts: [] as DeliveryStatusCount[]
    
  };

  // Charts Data
  revenueChartData: any[] = [];
  orderStatusData: any[] = [];
  
  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      groupBy: ['day']
    });
  }

  ngOnInit(): void {
    this.loadAnalytics();
    this.setupFilterListeners();
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.loadAnalytics();
    });
  }

  loadAnalytics(): void {
    this.loading = true;
    const filters = this.filterForm.value;

    this.ordersService.getOrderAnalytics(filters).subscribe({
      next: (data) => {
        this.summary = {
          totalOrders: data.dashboardData.totalOrders,
          totalRevenue: data.dashboardData.totalRevenue,
          averageOrderValue: data.dashboardData.averageOrderValue,
          conversionRate: data.dashboardData.conversionRate,
          totalRepeatCustomers: data.dashboardData.totalRepeatCustomers,
          deliveryStatusCounts: data.dashboardData.deliveryStatusCounts

        };
        this.revenueChartData = this.prepareRevenueChartData(data.dashboardData.revenueTrend);
        this.orderStatusData = this.prepareOrderStatusData(data.dashboardData.orderStatusDistribution);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }

  private prepareRevenueChartData(data: any[]): any[] {
    return data.map(item => ({
      name: item._id,
      value: item.totalRevenue
    }));
  }

  private prepareOrderStatusData(data: any[]): any[] {
    return data.map(item => ({
      name: item.status,
      value: item.count
    }));
  }

  calculateGrowth(current: number, previous: number): number {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  }
}