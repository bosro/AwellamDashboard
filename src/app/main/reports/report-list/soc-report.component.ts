import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-purchasing-report',
  templateUrl: './soc-report.component.html',
})
export class SOCReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  socDetails: any[] = [];
// startDate: string;
// endDate: string;

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

  generateSOCReport(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.loading = true;
    this.reportsService.getSOCReport(startDate, endDate).subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `soc-report-${startDate}-to-${endDate}.xlsx`;
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
          this.socDetails = json.map((soc: any) => ({
            dispatchDate: new Date(soc.dispatchDate).toLocaleDateString(),
            socNumber: soc.socNumber,
            quantity: soc.quantity,
            productName: soc.productName,
            plantName: soc.plantName,
            assignedTruck: soc.assignedTruck,
            assignedDriver: soc.assignedDriver,
          }));
        };
        reader.readAsArrayBuffer(blob);
  
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating SOC report:', error);
        this.loading = false;
      },
    });
  }

//   generatePurchasingReport(): void {
//     if (this.filterForm.invalid) return;

//     this.loading = true;
//     const { startDate, endDate } = this.filterForm.value;

//     this.reportsService.getPurchasingReport(startDate, endDate).subscribe({
//       next: (blob: Blob) => {
//         // Download the Excel file
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `purchasing-report-${startDate}-to-${endDate}.xlsx`;
//         link.click();
//         window.URL.revokeObjectURL(url);

//         // Parse the Excel file and display its data
//         const reader = new FileReader();
//         reader.onload = (e: any) => {
//           const data = new Uint8Array(e.target.result);
//           const workbook = XLSX.read(data, { type: 'array' });
//           const firstSheetName = workbook.SheetNames[0];
//           const worksheet = workbook.Sheets[firstSheetName];
//           const json = XLSX.utils.sheet_to_json(worksheet);

//           // Transform data to match the required format
//           this.purchasingData = json.map((purchase: any) => ({
//             Date: new Date(purchase.dateOfPurchase).toLocaleDateString(),
//             Plant: purchase.plantId?.name || "N/A",
//             Category: purchase.categoryId?.name || "N/A",
//             Product: purchase.productId?.name || "N/A",
//             Quantity: purchase.quantity,
//             PaymentRef: purchase.paymentRef,
//           }));
//         };
//         reader.readAsArrayBuffer(blob);

//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error generating purchasing report:', error);
//         this.loading = false;
//       },
//     });
//   }
}