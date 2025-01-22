import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Report, ReportParameters, ReportSchedule, ReportType } from '../shared/types/report.interface';
import { ReportTemplate } from '../shared/types/report-template.interface';
import { ScheduledReport, ScheduleUpdateParams } from '../shared/types/report-schedule.interface';

interface ShareLinkResponse {
  url: string;
  expiresAt?: Date;
}


@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = '/api/reports';

  constructor(private http: HttpClient) {}

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  generateReport(parameters: ReportParameters): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/generate`, parameters);
  }

  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  // scheduleReport(id: string, schedule: any): Observable<Report> {
  //   return this.http.post<Report>(`${this.apiUrl}/${id}/schedule`, schedule);
  // }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // downloadReport(id: string): Observable<Blob> {
  //   return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  // }

  getReportTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/templates`);
  }


  createTemplate(template: Omit<ReportTemplate, 'id'>): Observable<ReportTemplate> {
    return this.http.post<ReportTemplate>(`${this.apiUrl}/templates`, template);
  }

  updateTemplate(id: string, template: Omit<ReportTemplate, 'id'>): Observable<ReportTemplate> {
    return this.http.put<ReportTemplate>(`${this.apiUrl}/templates/${id}`, template);
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`);
  }

  getScheduledReports(): Observable<ScheduledReport[]> {
    return this.http.get<ScheduledReport[]>(`${this.apiUrl}/schedules`);
  }

  scheduleReport(id: string, schedule: ScheduleUpdateParams): Observable<ReportSchedule> {
    return this.http.post<ReportSchedule>(`${this.apiUrl}/${id}/schedule`, schedule);
  }

  updateSchedule(reportId: string, updates: ScheduleUpdateParams): Observable<ReportSchedule> {
    return this.http.put<ReportSchedule>(`${this.apiUrl}/${reportId}/schedule`, updates);
  }

  toggleSchedule(reportId: string, active: boolean): Observable<ReportSchedule> {
    return this.http.patch<ReportSchedule>(`${this.apiUrl}/${reportId}/schedule/toggle`, { active });
  }

  deleteSchedule(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}/schedule`);
  }
  
  generateShareLink(reportId: string, expirationDays: number = 7): Observable<ShareLinkResponse> {
    return this.http.post<ShareLinkResponse>(`${this.apiUrl}/${reportId}/share`, {
      expirationDays
    });
  }

  downloadReport(id: string, format: string = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      params: { format },
      responseType: 'blob'
    });
  }
}