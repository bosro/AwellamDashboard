import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { Report, ReportStatus, ReportType } from '../../../shared/types/report.interface';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html'
})
export class ReportListComponent implements OnInit {
  reports: Report[] = [];
  loading = false;
  searchTerm = '';
  selectedType: ReportType | '' = '';
  readonly ReportStatus = ReportStatus;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadReports();
  }
  loadReports(): void {
    this.loading = true;
    this.reportsService.getReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.loading = false;
      }
    });
  }

  deleteReport(id: string): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportsService.deleteReport(id).subscribe({
        next: () => {
          this.reports = this.reports.filter(report => report.id !== id);
        },
        error: (error) => console.error('Error deleting report:', error)
      });
    }
  }

  downloadReport(id: string): void {
    this.reportsService.downloadReport(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${id}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error downloading report:', error)
    });
  }

}