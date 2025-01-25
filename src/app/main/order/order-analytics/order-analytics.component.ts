// components/order-analytics/order-analytics.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdersService } from '../../../services/order.service';

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
    repeatCustomerRate: 0
  };

  // Charts Data
  revenueChartData: any[] = [];
  orderStatusData: any[] = [];
  topProducts: any[] = [];
  customerSegments: any[] = [];
  salesByRegion: any[] = [];
  
  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      groupBy: ['day'],
      includeRefunds: [true]
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

    // this.ordersService.getOrderAnalytics(filters).subscribe({
    //   next: (data) => {
    //     this.summary = data.summary;
    //     this.revenueChartData = this.prepareRevenueChartData(data.revenue);
    //     this.orderStatusData = this.prepareOrderStatusData(data.statuses);
    //     this.topProducts = data.topProducts;
    //     this.customerSegments = data.customerSegments;
    //     this.salesByRegion = data.salesByRegion;
        
    //     // Calculate growth metrics
    //     if (data.previousPeriod) {
    //       this.orderGrowth = this.calculateGrowth(
    //         data.summary.totalOrders,
    //         data.previousPeriod.totalOrders
    //       );
    //       this.revenueGrowth = this.calculateGrowth(
    //         data.summary.totalRevenue,
    //         data.previousPeriod.totalRevenue
    //       );
    //     }
        
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading analytics:', error);
    //     this.loading = false;
    //   }
    // });
  }

  private prepareRevenueChartData(data: any[]): any[] {
    return data.map(item => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orders,
      refunds: item.refunds
    }));
  }

  private prepareOrderStatusData(statuses: any): any[] {
    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count,
      color: this.getStatusColor(status)
    }));
  }

  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#FCD34D',
      processing: '#60A5FA',
      shipped: '#818CF8',
      delivered: '#34D399',
      cancelled: '#F87171',
      refunded: '#9CA3AF'
    };
    return colors[status] || '#E5E7EB';
  }

  // exportAnalytics(format: 'csv' | 'excel'): void {
  //   const filters = this.filterForm.value;
  //   this.ordersService.exportOrders(format, { ...filters, type: 'analytics' }).subscribe({
  //     next: (blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = `order-analytics.${format}`;
  //       link.click();
  //       window.URL.revokeObjectURL(url);
  //     },
  //     error: (error) => console.error('Error exporting analytics:', error)
  //   });
  // }

  calculateGrowth(current: number, previous: number): number {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  }
}