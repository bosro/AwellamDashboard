import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../../mock/mock-dashboard.service';
import { DashboardMetrics } from '../../../mock/mock-dashboard.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics!: DashboardMetrics;
  activityLog:any[] = [];
  alerts:any[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  // Chart Data
  revenueData:any[] = [];
  deliveryPerformance:any[] = [];
  inventoryStatus:any[] = [];
  vehicleUtilization:any[] = [];
  fuelConsumption:any[] = [];

  // Date Ranges
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' }
  ];
  selectedRange = 'week';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Load main metrics
    this.dashboardService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.metrics = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading metrics:', error);
          this.loading = false;
        }
      });

    // Load activity logs
    this.dashboardService.getActivityLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(logs => this.activityLog = logs);

    // Load alerts
    this.dashboardService.getAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => this.alerts = alerts);

    this.loadChartData();
  }

  private loadChartData(): void {
    this.dashboardService.getRevenueChart(this.selectedRange)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.revenueData = data);

    this.dashboardService.getDeliveryPerformance()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.deliveryPerformance = data);

    this.dashboardService.getInventoryStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.inventoryStatus = data);

    this.dashboardService.getVehicleUtilization()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.vehicleUtilization = data);

    this.dashboardService.getFuelConsumption()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.fuelConsumption = data);
  }

  private setupAutoRefresh(): void {
    // Auto refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000);

    this.destroy$.subscribe(() => clearInterval(refreshInterval));
  }

  onDateRangeChange(value: string): void {
    this.selectedRange = value;
    this.loadChartData();
  }

  exportDashboard(format: 'excel' | 'pdf'): void {
    this.dashboardService.exportDashboardReport(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-report.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  getPerformanceStatus(value: number, threshold: number = 80): string {
    if (value >= threshold) return 'success';
    if (value >= threshold - 20) return 'warning';
    return 'danger';
  }

  getTrendIcon(current: number, previous: number): string {
    if (current > previous) return 'ri-arrow-up-line text-green-500';
    if (current < previous) return 'ri-arrow-down-line text-red-500';
    return 'ri-more-line text-gray-500';
  }
}