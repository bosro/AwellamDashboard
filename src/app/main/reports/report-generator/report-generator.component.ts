// components/report-generator/report-generator.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportsService } from '../../../services/reports.service';
import { ReportType } from '../../../shared/types/report.interface';

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html'
})
export class ReportGeneratorComponent implements OnInit {
  reportForm: FormGroup;
  loading = false;
  templates: any[] = [];
  reportTypes = Object.values(ReportType);
  
  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private router: Router
  ) {
    this.reportForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      dateRange: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required]
      }),
      template: [''],
      format: ['pdf', Validators.required],
      locations: [[]],
      productTypes: [[]],
      schedule: this.fb.group({
        enabled: [false],
        frequency: ['daily'],
        time: [''],
        recipients: ['']
      })
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.reportsService.getReportTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
      },
      error: (error) => console.error('Error loading templates:', error)
    });
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      this.loading = true;
      const formData = this.reportForm.value;
      
      this.reportsService.generateReport(formData).subscribe({
        next: (report) => {
          this.loading = false;
          this.router.navigate(['/reports/viewer', report.id]);
        },
        error: (error) => {
          console.error('Error generating report:', error);
          this.loading = false;
        }
      });
    }
  }

  onTemplateChange(event: Event): void {
    const templateId = (event.target as HTMLSelectElement).value;
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      this.reportForm.patchValue({
        type: template.type,
        format: template.format,
        locations: template.locations,
        productTypes: template.productTypes
      });
    }
  }
  
}
