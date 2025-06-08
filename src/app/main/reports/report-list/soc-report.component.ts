import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-soc-report',
  templateUrl: './soc-report.component.html',
})
export class SOCReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  socDetails: any[] = [];
  currentPage = 1;
  pageSize = 15;
  totalItems = 0;
  Math= Math

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
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayString = today.toISOString().split('T')[0];
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    this.filterForm.patchValue({
      startDate: todayString,
      endDate: tomorrowString
    });

    this.getSOCReportDetails();
  }

  getSOCReportDetails(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.loading = true;
    this.reportsService.getSOCReportDetails(startDate, endDate).subscribe({
      next: (data: any) => {
        this.socDetails = data.data.map((soc: any) => ({
          dispatchDate: new Date(soc.dispatchDate).toLocaleDateString(),
          socNumber: soc.socNumber,
          quantity: soc.quantity,
          productName: soc.productName,
          plantName: soc.plantName,
          assignedTruck: soc.assignedTruck,
          assignedDriver: soc.assignedDriver,
          assignedCustomer:soc.assignedCustomer
        }));
        this.totalItems = this.socDetails.length;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching SOC report details:', error);
        this.loading = false;
      }
    });
  }

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
  
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating SOC report:', error);
        this.loading = false;
      },
    });
  }

  get paginatedSOCDetails(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.socDetails.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }
}