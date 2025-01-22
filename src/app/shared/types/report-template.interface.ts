// report-template.interface.ts
import { ReportType } from './report.interface';

export interface ChartOptions {
  showCharts: boolean;
  chartTypes: string[];
  colors: string[];
}

export interface DateRange {
  type: 'custom' | 'last7days' | 'last30days' | 'lastMonth';
  start?: string;
  end?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  format: 'pdf' | 'excel' | 'csv';
  locations: string[];
  productTypes: string[];
  defaultDateRange: DateRange;
  chartOptions: ChartOptions;
  grouping?: string;
  sortBy?: string;
  filters: ReportFilter[];
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}