import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-purchasing-report',
  templateUrl: './purchasing-report.component.html',
})
export class PurchasingReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  purchasingData: any[] = [];

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

  generatePurchasingReport(): void {
    if (this.filterForm.invalid) return;

    this.loading = true;
    const { startDate, endDate } = this.filterForm.value;

    this.reportsService.getPurchasingReport(startDate, endDate).subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `purchasing-report-${startDate}-to-${endDate}.xlsx`;
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
          this.purchasingData = json.map((purchase: any) => ({
            Date: new Date(purchase.dateOfPurchase).toLocaleDateString(),
            Plant: purchase.plantId?.name || "N/A",
            Category: purchase.categoryId?.name || "N/A",
            Product: purchase.productId?.name || "N/A",
            Quantity: purchase.quantity,
            PaymentRef: purchase.paymentRef,
          }));
        };
        reader.readAsArrayBuffer(blob);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating purchasing report:', error);
        this.loading = false;
      },
    });
  }
}