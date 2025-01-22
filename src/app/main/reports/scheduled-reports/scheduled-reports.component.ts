import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ReportsService } from "../../../services/reports.service";
import { 
  ScheduledReport, 
  ReportFrequency, 
  ReportFormat 
} from "../../../shared/types/report-schedule.interface";

@Component({
  selector: 'app-scheduled-reports',
  templateUrl: './scheduled-reports.component.html'
})
export class ScheduledReportsComponent implements OnInit {
  scheduledReports: ScheduledReport[] = [];
  loading = false;
  showScheduleForm = false;
  selectedReport: ScheduledReport | null = null;
  scheduleForm!: FormGroup;
  
  frequencies: ReportFrequency[] = ['daily', 'weekly', 'monthly'];
  formats: ReportFormat[] = ['pdf', 'excel', 'csv'];
  
  constructor(
    private reportsService: ReportsService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.scheduleForm = this.fb.group({
      frequency: ['daily', Validators.required],
      time: ['', Validators.required],
      daysOfWeek: [[]],
      dayOfMonth: [''],
      recipients: ['', Validators.required],
      format: ['pdf'],
      active: [true],
      notifyOnCompletion: [true],
      retryOnFailure: [true],
      maxRetries: [3]
    });

    // Add conditional validators based on frequency
    this.scheduleForm.get('frequency')?.valueChanges.subscribe(frequency => {
      const daysOfWeekControl = this.scheduleForm.get('daysOfWeek');
      const dayOfMonthControl = this.scheduleForm.get('dayOfMonth');

      if (frequency === 'weekly') {
        daysOfWeekControl?.setValidators([Validators.required]);
        dayOfMonthControl?.clearValidators();
      } else if (frequency === 'monthly') {
        dayOfMonthControl?.setValidators([Validators.required]);
        daysOfWeekControl?.clearValidators();
      } else {
        daysOfWeekControl?.clearValidators();
        dayOfMonthControl?.clearValidators();
      }

      daysOfWeekControl?.updateValueAndValidity();
      dayOfMonthControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadScheduledReports();
  }

  loadScheduledReports(): void {
    this.loading = true;
    this.reportsService.getScheduledReports().subscribe({
      next: (data) => {
        this.scheduledReports = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading scheduled reports:', error);
        this.loading = false;
      }
    });
  }

  updateSchedule(reportId: string): void {
    if (this.scheduleForm.valid) {
      this.loading = true;
      this.reportsService.updateSchedule(reportId, this.scheduleForm.value).subscribe({
        next: () => {
          this.loadScheduledReports();
          this.showScheduleForm = false;
          this.scheduleForm.reset();
          this.selectedReport = null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating schedule:', error);
          this.loading = false;
        }
      });
    }
  }

  editSchedule(report: ScheduledReport): void {
    this.selectedReport = report;
    this.scheduleForm.patchValue(report.schedule);
    this.showScheduleForm = true;
  }

  toggleSchedule(reportId: string, active: boolean): void {
    this.reportsService.toggleSchedule(reportId, active).subscribe({
      next: () => {
        this.loadScheduledReports();
      },
      error: (error) => console.error('Error toggling schedule:', error)
    });
  }

  deleteSchedule(reportId: string): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.reportsService.deleteSchedule(reportId).subscribe({
        next: () => {
          this.loadScheduledReports();
        },
        error: (error) => console.error('Error deleting schedule:', error)
      });
    }
  }
}