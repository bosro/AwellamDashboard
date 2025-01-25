import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ReportsService } from "../../../services/reports.service";
import { DomSanitizer } from "@angular/platform-browser";
import { ChartData, Report, ReportStatus } from "../../../shared/types/report.interface";

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html'
})
export class ReportViewerComponent implements OnInit {
  report: Report | null = null;
  loading = true;
  error = '';
  chartData: any[] = [];
  currentPage = 1;
  totalPages = 1;
  exportFormat = 'pdf';
  shareUrl = '';
  showShareDialog = false;
  copySuccess = false;
  ReportStatus = ReportStatus; 

  constructor(
    private route: ActivatedRoute,
    private reportsService: ReportsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('id');
    if (reportId) {
      this.loadReport(reportId);
    }
  }

  loadReport(id: string): void {
    this.loading = true;
    this.reportsService.getReportById(id).subscribe({
      next: (data) => {
        this.report = data;
        this.prepareReportData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.error = 'Failed to load report';
        this.loading = false;
      }
    });
  }

  prepareReportData(): void {
    if (this.report?.data?.charts) {
      this.chartData = this.processChartData(this.report.data.charts);
    }
    
    if (this.report?.data?.pages) {
      this.totalPages = this.report.data.pages.length;
    }
  }

  private processChartData(charts: ChartData[]): ChartData[] {
    return charts.map(chart => ({
      ...chart,
      data: chart.data.map(item => ({
        ...item,
        value: Number(item.value)
      }))
    }));
  }

  downloadReport(): void {
    if (!this.report) return;

    this.reportsService.downloadReport(this.report.id, this.exportFormat).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.report?.name}.${this.exportFormat}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.error = 'Failed to download report';
      }
    });
  }

  shareReport(): void {
    if (!this.report) return;

    this.reportsService.generateShareLink(this.report.id).subscribe({
      next: (response) => {
        this.shareUrl = response.url;
        this.showShareDialog = true;
      },
      error: (error) => {
        console.error('Error generating share link:', error);
        this.error = 'Failed to generate share link';
      }
    });
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      this.error = 'Failed to copy to clipboard';
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
}