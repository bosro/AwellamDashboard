import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
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
  @Input() metrics: any = {};

  filterForm!: FormGroup;
  chartData: ChartData[] = [];
  view: [number, number] = [700, 300];
  chartHeight = '400px';


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

  colorScheme = 'cool'
  

  viewOptions = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' }
  ];

  comparisonOptions = [
    { id: 'previousPeriod', name: 'Previous Period' },
    { id: 'lastYear', name: 'Last Year' }
  ];



  constructor(private fb: FormBuilder) {
    this.createFilterForm();
    this.updateChartDimensions();
  }
  ngOnInit(): void {
    this.processChartData();
    this.updateChartDimensions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.processChartData();
    }
  }

  

  private updateChartDimensions(): void {
    // Get the container width
    const containerWidth = window.innerWidth;
    let chartWidth: number;
    let chartHeight: number;

    // Adjust dimensions based on screen size
    if (containerWidth < 640) { // Mobile
      chartWidth = containerWidth - 32; // Accounting for padding
      chartHeight = 300;
      this.legend = false;
      this.showYAxisLabel = false;
      this.showXAxisLabel = false;
    } else if (containerWidth < 1024) { // Tablet
      chartWidth = containerWidth - 48;
      chartHeight = 350;
      this.legend = true;
      this.showYAxisLabel = true;
      this.showXAxisLabel = true;
    } else { // Desktop
      chartWidth = containerWidth - 64;
      chartHeight = 400;
      this.legend = true;
      this.showYAxisLabel = true;
      this.showXAxisLabel = true;
    }

    this.view = [chartWidth, chartHeight];
    this.chartHeight = `${chartHeight}px`;
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


  @HostListener('window:resize')
  onResize(): void {
    this.updateChartDimensions();
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