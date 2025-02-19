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
  currentPage = 1;
  pageSize = 15;
  totalItems = 0;
Math=Math
  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService
  ) {
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
  
    this.filterForm.patchValue({
      startDate: todayString,
      endDate: todayString
    });
  
    this.getSalesReportDetails();
  }

  getSalesReportDetails(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.loading = true;
    this.reportsService.getSalesReportDetails(startDate, endDate).subscribe({
      next: (data: any) => {
        this.salesData = data.data.map((sale: any) => ({
          Date: sale.Date,
          Customer: sale.Customer,
          Plant: sale.Plant,
          Product: sale.Product,
          Quantity: sale.Quantity,
          Price: sale.Price,
          Driver: sale.Driver,
          SocNumber: sale.SocNumber,
          SocDestination: sale.SocDestination,
          SocRates: sale.SocRates,
        }));
        this.totalItems = this.salesData.length;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching sales report details:', error);
        this.loading = false;
      }
    });
  }

  generateSalesReport(): void {
    // if (this.filterForm.invalid) return;

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

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error generating sales report:', error);
        this.loading = false;
      },
    });
  }

  get paginatedSalesData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.salesData.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }
}