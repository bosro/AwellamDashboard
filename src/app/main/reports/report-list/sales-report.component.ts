import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
})
export class SalesReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  salesData: any[] = [];

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

  generateSalesReport(): void {
    if (this.filterForm.invalid) return;

    this.loading = true;
    const { startDate, endDate } = this.filterForm.value;

    this.reportsService.getSalesReport(startDate, endDate).subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sales-report-${startDate}-to-${endDate}.xlsx`;
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
          this.salesData = json;
        };
        reader.readAsArrayBuffer(blob);

        this.loading = false;
      },
      error: (error:any) => {
        console.error('Error generating sales report:', error);
        this.loading = false;
      },
    });
  }
}