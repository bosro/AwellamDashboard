// report.interface.ts
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  createdAt: Date;
  updatedAt: Date;
  parameters: ReportParameters;
  schedule?: ReportSchedule;
  status: ReportStatus;
  fileUrl?: string;
  data?: ReportData; // Add this interface
}

export interface ReportData {
  charts?: ChartData[];
  tables?: TableData[];
  pages?: PageData[];
}

export interface ChartData {
  title: string;
  type: string;
  data: Array<{
    label: string;
    value: number;
  }>;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: any[][];
}

export interface PageData {
  content: any;
  pageNumber: number;
}

export interface ReportParameters {
  dateRange: {
    start: Date;
    end: Date;
  };
  locations?: string[];
  productTypes?: string[];
  reportType: string;
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  active: boolean;
}

export enum ReportType {
  SALES = 'sales',
  INVENTORY = 'inventory',
  PURCHASES = 'purchases',
  TRANSPORT = 'transport',
  MAINTENANCE = 'maintenance',
  PERFORMANCE = 'performance'
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}