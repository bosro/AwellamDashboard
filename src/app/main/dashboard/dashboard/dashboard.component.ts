import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics: any = {};
  loading = true;
  private destroy$ = new Subject<void>();

  // Chart Data
  revenueData: any[] = [];

  // Date Ranges
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' }
  ];
  selectedRange = 'week';

  constructor(private dashboardService: DashboardService , private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  DriverList(){
    this.router.navigate(['main/transport/trucks'])
  }

  OrderList(){
    this.router.navigate(['main/orders/list'])
  }
  private loadDashboardData(): void {
    this.loading = true;

    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.metrics = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.loading = false;
        }
      });

    this.loadChartData();
  }

  private loadChartData(): void {
    this.dashboardService.getRevenueChart(this.selectedRange)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.revenueData = data);
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
}