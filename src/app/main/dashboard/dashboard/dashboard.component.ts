import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('stockChart') stockCanvas!: ElementRef;
  @ViewChild('deliveryChart') deliveryCanvas!: ElementRef;
  @ViewChild('growthChart') growthCanvas!: ElementRef;
  @ViewChild('revenueChart') revenueCanvas!: ElementRef;

  dashboardData: any = {
    activeDrivers: 0,
    totalRevenue: 0,
    totalPendingOrders: 0,
    conversionRate: 0,
    lowestStockItems: [],
    deliveredProducts: [],
    deliveredProductsLastMonth: [],
    totalQuantityDelivered: 0,
    revenueMetrics: {
      totalRevenue: 0,
      averageRevenue: 0,
      growth: 0,
      peakRevenue: 0
    },
    lastMonthRevenue: 0,
    revenueGrowth: 0,
    totalRevenueResult: [],
    averageOrderValue: 0,
    totalDeliveries: 0
  };

  private stockChart: Chart | null = null;
  private deliveryChart: Chart | null = null;
  private growthChart: Chart | null = null;
  private revenueChart: Chart | null = null;
  private destroy$ = new Subject<void>();

  // Chart type toggles
  private stockChartType: 'bar' | 'line' = 'bar';
  private deliveryChartType: 'doughnut' | 'pie' = 'doughnut';

  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' }
  ];
  selectedRange = 'week';

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.stockChart) this.stockChart.destroy();
    if (this.deliveryChart) this.deliveryChart.destroy();
    if (this.growthChart) this.growthChart.destroy();
    if (this.revenueChart) this.revenueChart.destroy();
  }

  private initializeCharts(): void {
    // Stock Level Chart
    const stockCtx = this.stockCanvas.nativeElement.getContext('2d');
    this.stockChart = new Chart(stockCtx, {
      type: this.stockChartType,
      data: {
        labels: this.dashboardData.lowestStockItems?.map((item: any) => item.name),
        datasets: [{
          label: 'Current Stock',
          data: this.dashboardData.lowestStockItems?.map((item: any) => item.totalStock),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Levels by Product'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantity in Stock'
            }
          }
        }
      }
    });

    // Delivery Distribution Chart
    const deliveryCtx = this.deliveryCanvas.nativeElement.getContext('2d');
    this.deliveryChart = new Chart(deliveryCtx, {
      type: this.deliveryChartType,
      data: {
        labels: this.dashboardData.deliveredProducts?.map((product: any) => product.name),
        datasets: [{
          data: this.dashboardData.deliveredProducts?.map((product: any) => product.totalDelivered),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Delivery Distribution'
          }
        }
      }
    });

    // Monthly Growth Chart (Last Month Deliveries)
    const growthCtx = this.growthCanvas.nativeElement.getContext('2d');
    this.growthChart = new Chart(growthCtx, {
      type: 'bar',
      data: {
        labels: this.dashboardData.deliveredProductsLastMonth?.map((product: any) => product.name) || [],
        datasets: [{
          label: 'Last Month Deliveries',
          data: this.dashboardData.deliveredProductsLastMonth?.map((product: any) => product.totalDelivered) || [],
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Last Month Deliveries'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Deliveries'
            }
          }
        }
      }
    });

    // Revenue Metrics Chart
    const revenueCtx = this.revenueCanvas.nativeElement.getContext('2d');
    this.revenueChart = new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: this.dashboardData.totalRevenueResult?.map((result: any) => result._id),
        datasets: [
          {
            label: 'Total Revenue',
            data: this.dashboardData.totalRevenueResult?.map((result: any) => result.total),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Average Revenue',
            data: Array(this.dashboardData.totalRevenueResult.length).fill(this.dashboardData.revenueMetrics.averageRevenue),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          },
          {
            label: 'Peak Revenue',
            data: Array(this.dashboardData.totalRevenueResult.length).fill(this.dashboardData.revenueMetrics.peakRevenue),
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Revenue Metrics'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue'
            }
          }
        }
      }
    });
  }

  private loadDashboardData(): void {
    const queryParams = this.getQueryParams();
    this.dashboardService.getDashboardData(queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.dashboardData = response;
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
        }
      });
  }


  private getQueryParams(): any {
    const currentDate = new Date(); let queryParams: any = {};

    switch (this.selectedRange) {
      case 'today':
        queryParams.day = currentDate.getDate();
        queryParams.month = currentDate.getMonth() + 1;
        queryParams.year = currentDate.getFullYear();
        break;
      case 'week':
        // Assuming the backend handles the week range based on the current date
        queryParams.week = this.getWeekNumber(currentDate); // Implement getWeekNumber method
        queryParams.year = currentDate.getFullYear();
        break;
      case 'month':
        queryParams.month = currentDate.getMonth() + 1;
        queryParams.year = currentDate.getFullYear();
        break;
      case 'year':
        queryParams.year = currentDate.getFullYear();
        break;
    }

    return queryParams;
  }



  private getWeekNumber(date: Date): number { const firstDayOfYear = new Date(date.getFullYear(), 0, 1); const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000; return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7); }

  private updateCharts(): void {
    if (this.stockChart) {
      this.stockChart.data.labels = this.dashboardData.lowestStockItems?.map((item: any) => item.name);
      this.stockChart.data.datasets[0].data = this.dashboardData.lowestStockItems?.map((item: any) => item.totalStock);
      this.stockChart.update();
    }

    if (this.deliveryChart) {
      this.deliveryChart.data.labels = this.dashboardData.deliveredProducts?.map((product: any) => product.name);
      this.deliveryChart.data.datasets[0].data = this.dashboardData.deliveredProducts?.map((product: any) => product.totalDelivered);
      this.deliveryChart.update();
    }

    if (this.growthChart) {
      this.growthChart.data.labels = this.dashboardData.deliveredProductsLastMonth?.map((product: any) => product.name) || [];
      this.growthChart.data.datasets[0].data = this.dashboardData.deliveredProductsLastMonth?.map((product: any) => product.totalDelivered) || [];
      this.growthChart.update();
    }

    if (this.revenueChart) {
      this.revenueChart.data.labels = this.dashboardData.totalRevenueResult?.map((result: any) => result._id);
      this.revenueChart.data.datasets[0].data = this.dashboardData.totalRevenueResult?.map((result: any) => result.total);
      this.revenueChart.data.datasets[1].data = Array(this.dashboardData.totalRevenueResult.length).fill(this.dashboardData.revenueMetrics.averageRevenue);
      this.revenueChart.data.datasets[2].data = Array(this.dashboardData.totalRevenueResult.length).fill(this.dashboardData.revenueMetrics.peakRevenue);
      this.revenueChart.update();
    }
  }

  toggleChartType(chart: 'stock' | 'delivery'): void {
    if (chart === 'stock') {
      this.stockChartType = this.stockChartType === 'bar' ? 'line' : 'bar';
      if (this.stockChart) {
        (this.stockChart.config as ChartConfiguration).type = this.stockChartType;
        this.stockChart.update();
      }
    } else {
      this.deliveryChartType = this.deliveryChartType === 'doughnut' ? 'pie' : 'doughnut';
      if (this.deliveryChart) {
        (this.deliveryChart.config as ChartConfiguration).type = this.deliveryChartType;
        this.deliveryChart.update();
      }
    }
  }

  private setupAutoRefresh(): void {
    const refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    this.destroy$.subscribe(() => clearInterval(refreshInterval));
  }

  onDateRangeChange(event: any): void {
    this.selectedRange = event.target.value;
    this.loadDashboardData();
  }

  navigateToDrivers(): void {
    this.router.navigate(['main/transport/trucks']);
  }

  navigateToOrders(): void {
    this.router.navigate(['main/orders/list']);
  }
}