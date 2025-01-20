import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FuelTrackingService, FuelRecord, FuelAnalytics } from '../../services/fuel-tracking.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface FuelMetrics {
  totalConsumption: number;
  averageEfficiency: number;
  totalCost: number;
  averageCostPerLiter: number;
  bestEfficiency: number;
  worstEfficiency: number;
}

@Component({
  selector: 'app-fuel-analytics',
  templateUrl: './fuel-analytics.component.html'
})
export class FuelAnalyticsComponent implements OnInit {
  loading = false;
  fuelRecords: FuelRecord[] = [];
  metrics: FuelMetrics;
  filterForm: FormGroup;
  
  // Chart data
  consumptionTrend = [];
  efficiencyTrend = [];
  costTrend = [];
  locationDistribution = [];

  dateRanges = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 3 Months', value: '3m' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'Year to Date', value: 'ytd' },
    { label: 'Custom Range', value: 'custom' }
  ];

  constructor(
    private fuelService: FuelTrackingService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadAnalytics();
    this.setupFilterSubscription();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      dateRange: ['30d'],
      customDateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      truckId: [''],
      location: ['']
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadAnalytics();
      });
  }

  loadAnalytics(): void {
    this.loading = true;
    const filters = this.getFilterParams();

    this.fuelService.getFuelAnalytics(filters).subscribe({
      next: (data) => {
        this.processAnalyticsData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading fuel analytics:', error);
        this.loading = false;
      }
    });
  }

  private getFilterParams(): any {
    const formValue = this.filterForm.value;
    const params: any = {};

    if (formValue.dateRange === 'custom') {
      params.startDate = formValue.customDateRange.start;
      params.endDate = formValue.customDateRange.end;
    } else {
      params.range = formValue.dateRange;
    }

    if (formValue.truckId) params.truckId = formValue.truckId;
    if (formValue.location) params.location = formValue.location;

    return params;
  }

  private processAnalyticsData(data: FuelAnalytics): void {
    // Process metrics
    this.metrics = {
      totalConsumption: data.totalConsumption,
      averageEfficiency: data.averageEfficiency,
      totalCost: data.totalCost,
      averageCostPerLiter: data.totalCost / data.totalConsumption,
      bestEfficiency: Math.min(...data.efficiencyTrend.map(e => e.value)),
      worstEfficiency: Math.max(...data.efficiencyTrend.map(e => e.value))
    };

    // Process chart data
    this.consumptionTrend = this.formatChartData(data.consumptionTrend);
    this.efficiencyTrend = this.formatChartData(data.efficiencyTrend);
    this.costTrend = this.formatChartData(data.costTrend);
    this.locationDistribution = this.formatPieChartData(data.locationDistribution);
  }

  private formatChartData(data: any[]): any[] {
    return [{
      name: 'Value',
      series: data.map(item => ({
        name: new Date(item.date),
        value: item.value
      }))
    }];
  }

  private formatPieChartData(data: any[]): any[] {
    return data.map(item => ({
      name: item.location,
      value: item.total
    }));
  }

  exportAnalytics(format: 'excel' | 'pdf'): void {
    const filters = this.getFilterParams();
    this.fuelService.exportFuelData(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fuel-analytics.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  calculateEfficiencyChange(): number {
    if (!this.efficiencyTrend[0]?.series?.length) return 0;
    const current = this.efficiencyTrend[0].series[this.efficiencyTrend[0].series.length - 1].value;
    const previous = this.efficiencyTrend[0].series[0].value;
    return ((current - previous) / previous) * 100;
  }

  getEfficiencyTrend(): 'improving' | 'declining' | 'stable' {
    const change = this.calculateEfficiencyChange();
    if (Math.abs(change) < 1) return 'stable';
    return change < 0 ? 'improving' : 'declining';
  }
}