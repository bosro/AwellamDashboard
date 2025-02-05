import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-claims-report',
  templateUrl: './claims-report.component.html',
})
export class ClaimsReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  claimsData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService
  ) {
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  generateClaimsReport(): void {
    if (this.filterForm.invalid) return;

    this.loading = true;
    const { startDate, endDate } = this.filterForm.value;

    this.reportsService.getClaimsReport(startDate, endDate).subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims-report-${startDate}-to-${endDate}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        // Parse the Excel file and display its data
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          // Transform data to match the required format
          this.claimsData = json.map((claim: any) => ({
            DATE: new Date(claim.date).toLocaleDateString(),
            DRIVER: claim.driver,
            CATEGORY: claim.category,
            DESTINATION: claim.destination,
            SOC: claim.soc,
            QTY: claim.quantity,
            RATE: claim.rate,
            'AMOUNT (100%)': claim.amount100,
            'AMOUNT (95%)': claim.amount95,
          }));
        };
        reader.readAsArrayBuffer(blob);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating claims report:', error);
        this.loading = false;
      },
    });
  }
}