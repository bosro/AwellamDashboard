// report-schedule.interface.ts
export type ReportFrequency = 'daily' | 'weekly' | 'monthly';
export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: ReportFrequency;
  time: string;
  daysOfWeek?: number[];  // 0-6 for Sunday-Saturday
  dayOfMonth?: number;    // 1-31
  recipients: string[];
  format: ReportFormat;
  active: boolean;
  notifyOnCompletion: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ScheduleUpdateParams {
  frequency?: ReportFrequency;
  time?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  recipients?: string[];
  format?: ReportFormat;
  active?: boolean;
  notifyOnCompletion?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export interface ScheduledReport {
  id: string;
  name: string;
  type: string;
  schedule: ReportSchedule;
  lastGeneratedReport?: {
    id: string;
    status: string;
    generatedAt: Date;
  };
}