// customer.report.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerAccountService } from '../../../services/customer-account.service';
import { CustomersService } from '../../../services/customer.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-customer-summary',
  templateUrl: './customer.report.component.html'
})
export class CustomerSummaryComponent implements OnInit {
  customers: any[] = [];
  customerAccount: any = null;
  loading = false;
  searchAttempted = false;
  filteredCustomers: any[] = []
  
  // Activities pagination
  activities: any[] = [];
  currentActivityPage = 1;
  activityPageSize = 10;
  totalActivityPages = 0;
  
  filterForm: FormGroup;
  
  constructor(
    private customerAccountService: CustomerAccountService,
    private customersService: CustomersService,
    private fb: FormBuilder
  ) {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    
    this.filterForm = this.fb.group({
      customerId: ['', Validators.required],
      startDate: [this.formatDate(firstDayOfYear), Validators.required],
      endDate: [this.formatDate(today), Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.loadCustomers();
  }
  
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  filterCustomers(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCustomers = this.customers.filter((customer) =>
      customer.fullName.toLowerCase().includes(searchValue)
    );
  }
  
  loadCustomers(): void {
    this.loading = true;
    this.customersService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.customers || [];
        this.filteredCustomers = [...this.customers];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }
  
  loadCustomerAccount(): void {
    if (this.filterForm.invalid) return;
    
    const values = this.filterForm.value;
    this.loading = true;
    this.searchAttempted = true;
    
    this.customerAccountService.getCustomerAccount(
      values.customerId,
      values.startDate,
      values.endDate
    ).subscribe({
      next: (response) => {
        this.customerAccount = response;
        
        // Process activities
        this.activities = response.data.activities.map((activity: any) => {
          // Keep all original properties
          return {
            ...activity,
            // Add computed properties only if needed
            displayType: activity.type === 'order' ? 'Order' : 'Payment',
            displayAmount: activity.type === 'order' ? activity.totalAmount : activity.amount,
            displayStatus: activity.type === 'order' ? 
              activity.paymentStatus : 
              (activity.balanceAfter >= 0 ? 'Completed' : 'Partial'),
            displayReference: activity.type === 'order' ? 
              activity.orderNumber : 
              (activity.paymentReference || activity.Reference || 'N/A')
          };
        });
  
        this.totalActivityPages = Math.ceil(this.activities.length / this.activityPageSize);
        this.currentActivityPage = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer account:', error);
        this.loading = false;
      }
    });
  }
  

  get paginatedActivities() {
    const startIndex = (this.currentActivityPage - 1) * this.activityPageSize;
    return this.activities.slice(startIndex, startIndex + this.activityPageSize);
  }

  changeActivityPage(page: number): void {
    if (page < 1 || page > this.totalActivityPages) return;
    this.currentActivityPage = page;
  }

  generatePageArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  exportToPdf(): void {
    if (!this.customerAccount) return;

    const doc = new jsPDF();
    const customerInfo = this.customerAccount.data.customerInfo;
    const accountSummary = this.customerAccount.data.accountSummary;

    // Add header
    doc.setFontSize(20);
    doc.text('Customer Account Summary', 105, 20, { align: 'center' });
    
    // Add customer information
    doc.setFontSize(12);
    doc.text(`Customer: ${customerInfo.fullName}`, 20, 40);
    doc.text(`Email: ${customerInfo.email}`, 20, 50);
    doc.text(`Phone: ${customerInfo.phoneNumber}`, 20, 60);
    doc.text(`Address: ${customerInfo.address}`, 20, 70);

    // Add account summary
    doc.text('Account Summary', 20, 90);
    doc.text(`Total Orders: ${accountSummary.totalOrders}`, 20, 100);
    doc.text(`Total Order Amount: GHS ${accountSummary.totalOrderAmount}`, 20, 110);
    doc.text(`Total Paid: GHS ${accountSummary.totalPaid}`, 20, 120);
    doc.text(`Current Balance: GHS ${accountSummary.currentBalance}`, 20, 130);

    // Add activities
    doc.text('Activity History', 20, 150);
    let yPos = 160;
    
    // Add table headers
    const headers = ['Date', 'Type', 'Reference', 'Amount', 'Status'];
    let startX = 20;
    headers.forEach(header => {
      doc.text(header, startX, yPos);
      startX += 35;
    });
    yPos += 10;

    // Add activities data
    this.activities.forEach(activity => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      startX = 20;
      doc.text(activity.displayDate, startX, yPos);
      doc.text(activity.displayType, startX + 35, yPos);
      doc.text(activity.displayReference, startX + 70, yPos);
      doc.text(`GHS ${activity.displayAmount}`, startX + 105, yPos);
      doc.text(activity.displayStatus, startX + 140, yPos);
      yPos += 10;
    });

    doc.save(`${customerInfo.fullName}_Account_Summary.pdf`);
  }

  printReport(): void {
    const printContent = document.createElement('div');
    const customerInfo = this.customerAccount.data.customerInfo;
    const accountSummary = this.customerAccount.data.accountSummary;

    printContent.innerHTML = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
        }
      </style>
      <div class="header">
        <h1>Customer Account Summary</h1>
        <p>Period: ${accountSummary.reportPeriod.from} to ${accountSummary.reportPeriod.to}</p>
      </div>
      <div class="section">
        <h2>Customer Information</h2>
        <p>Name: ${customerInfo.fullName}</p>
        <p>Email: ${customerInfo.email}</p>
        <p>Phone: ${customerInfo.phoneNumber}</p>
        <p>Address: ${customerInfo.address}</p>
      </div>
      <div class="section">
        <h2>Account Summary</h2>
        <p>Total Orders: ${accountSummary.totalOrders}</p>
        <p>Total Order Amount: GHS ${accountSummary.totalOrderAmount}</p>
        <p>Total Paid: GHS ${accountSummary.totalPaid}</p>
        <p>Current Balance: GHS ${accountSummary.currentBalance}</p>
      </div>
      <div class="section">
        <h2>Activity History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${this.activities.map(activity => `
              <tr>
                <td>${activity.displayDate}</td>
                <td>${activity.displayType}</td>
                <td>${activity.displayReference}</td>
                <td>GHS ${activity.displayAmount}</td>
                <td>${activity.displayStatus}</td>
                <td>${activity.type === 'order' ? 
                      `${activity.plantName} | ${activity.Product.join(', ')}` : 
                      activity.paymentMethod}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent.innerHTML);
    printWindow?.document.close();
    printWindow?.print();
  }
}
