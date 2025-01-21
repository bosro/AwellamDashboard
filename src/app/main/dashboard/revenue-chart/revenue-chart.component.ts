import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

interface ChartData {
  name: string;
  value?: number;
  series: any[];
}

@Component({
  selector: 'app-revenue-chart',
  templateUrl: './revenue-chart.component.html'
})
export class RevenueChartComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() loading = false;

  filterForm!: FormGroup;
  chartData: ChartData[] = [];
  view: [number, number] = [700, 300];

  // Chart options
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'Period';
  yAxisLabel = 'Revenue';
  timeline = true;
  showGridLines = true;

  colorScheme = {
    domain: '#3B82F6'
    // domain: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
  };

  viewOptions = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' }
  ];

  comparisonOptions = [
    { id: 'previousPeriod', name: 'Previous Period' },
    { id: 'lastYear', name: 'Last Year' }
  ];

  metrics = {
    totalRevenue: 0,
    averageRevenue: 0,
    growth: 0,
    peakRevenue: 0
  };

  constructor(private fb: FormBuilder) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.processChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.processChartData();
    }
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      view: ['daily'],
      comparison: ['previousPeriod'],
      showProjection: [false]
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.processChartData();
    });
  }

  private processChartData(): void {
    if (!this.data) return;

    const viewType = this.filterForm.get('view')!.value;
    const showComparison = this.filterForm.get('comparison')!.value;
    const showProjection = this.filterForm.get('showProjection')!.value;

    // Process current period data
    let processedData = this.data.map(item => ({
      name: this.formatDate(item.date, viewType),
      value: item.revenue
    }));

    // Calculate metrics
    this.calculateMetrics(processedData);

    // Add comparison data if selected
    if (showComparison) {
      const comparisonData = this.getComparisonData();
      this.chartData = [
        {
          name: 'Current Period',
          series: processedData
        },
        {
          name: 'Comparison Period',
          series: comparisonData
        }
      ];
    } else {
      this.chartData = [
        {
          name: 'Revenue',
          series: processedData
        }
      ];
    }

    // Add projection if selected
    if (showProjection) {
      const projectionData = this.calculateProjection(processedData);
      this.chartData.push({
        name: 'Projected',
        series: projectionData
      });
    }
  }

  private formatDate(date: string, viewType: string): string {
    const dateObj = new Date(date);
    switch (viewType) {
      case 'daily':
        return dateObj.toLocaleDateString();
      case 'weekly':
        return `Week ${this.getWeekNumber(dateObj)}`;
      case 'monthly':
        return dateObj.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      default:
        return date;
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private calculateMetrics(data: any[]): void {
    const values = data.map(item => item.value);
    this.metrics = {
      totalRevenue: values.reduce((a, b) => a + b, 0),
      averageRevenue: values.reduce((a, b) => a + b, 0) / values.length,
      peakRevenue: Math.max(...values),
      growth: this.calculateGrowth(values)
    };
  }

  private calculateGrowth(values: number[]): number {
    if (values.length < 2) return 0;
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    return ((lastValue - firstValue) / firstValue) * 100;
  }

  private getComparisonData(): any[] {
    // Implement comparison data logic
    return [];
  }

  private calculateProjection(data: any[]): any[] {
    // Implement projection calculation logic
    return [];
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

  onResize(event: any): void {
    this.view = [event.target.innerWidth * 0.7, 300];
  }

  formatValue(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }

  getGrowthClass(): string {
    if (this.metrics.growth > 0) return 'text-green-600';
    if (this.metrics.growth < 0) return 'text-red-600';
    return 'text-gray-600';
  }
}