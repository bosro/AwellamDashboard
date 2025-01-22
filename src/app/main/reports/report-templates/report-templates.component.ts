import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import { ReportType } from '../../../shared/types/report.interface';

@Component({
  selector: 'app-report-templates',
  templateUrl: './report-templates.component.html'
})
export class ReportTemplatesComponent implements OnInit {
  templates: any[] = [];
  loading = false;
  showForm = false;
  selectedTemplate: any = null;
  templateForm: FormGroup;
  reportTypes = Object.values(ReportType);

  constructor(
    private reportsService: ReportsService,
    private fb: FormBuilder
  ) {
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      format: ['pdf', Validators.required],
      locations: [[]],
      productTypes: [[]],
      defaultDateRange: this.fb.group({
        type: ['custom'], // custom, last7days, last30days, lastMonth, etc.
        start: [''],
        end: ['']
      }),
      chartOptions: this.fb.group({
        showCharts: [true],
        chartTypes: [[]],
        colors: [[]]
      }),
      grouping: [''],
      sortBy: [''],
      filters: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.reportsService.getReportTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.loading = false;
      }
    });
  }

  createTemplate(): void {
    if (this.templateForm.valid) {
      this.loading = true;
      this.reportsService.createTemplate(this.templateForm.value).subscribe({
        next: () => {
          this.loadTemplates();
          this.showForm = false;
          this.templateForm.reset();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating template:', error);
          this.loading = false;
        }
      });
    }
  }

  editTemplate(template: any): void {
    this.selectedTemplate = template;
    this.templateForm.patchValue(template);
    this.showForm = true;
  }

  deleteTemplate(id: string): void {
    if (confirm('Are you sure you want to delete this template?')) {
      this.reportsService.deleteTemplate(id).subscribe({
        next: () => {
          this.loadTemplates();
        },
        error: (error) => console.error('Error deleting template:', error)
      });
    }
  }
}
