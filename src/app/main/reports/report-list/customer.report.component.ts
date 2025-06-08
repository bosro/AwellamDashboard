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
  filteredCustomers: any[] = [];
  
  // For template use
  Math = Math;
  
  // Activities pagination
  activities: any[] = [];
  currentActivityPage = 1;
  activityPageSize = 10;
  totalActivityPages = 0;
  
  // Company logo path (update with your actual logo path)
  companyLogoPath = 'assets/images/company-logo.png';
  
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

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
        
        // Process activities - ensure balance fields are present even if 0
        this.activities = response.data.activities.map((activity: any) => {
          // Keep all original properties
          return {
            ...activity,
            // Ensure balance fields are present - set to 0 if undefined
            balanceBefore: activity.balanceBefore || 0,
            balanceAfter: activity.balanceAfter || 0,
            // Add computed properties for display
            displayType: activity.type === 'order' ? 'Order' : 'Payment',
            displayAmount: activity.type === 'order' ? activity.totalAmount : activity.amount,
            displayStatus: activity.type === 'order' ? 
              activity.paymentStatus : 
              (activity.balanceAfter >= 0 ? 'Completed' : 'Partial'),
            displayReference: activity.type === 'order' ? 
              activity.socNumber : 
              ( activity.paymentMethod || activity.paymentReference ||  activity.Reference ),
            displayDate: activity.formattedDate
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

  getPaginationPages(): number[] {
    // Show max 5 page numbers, centered around current page
    const totalPages = this.totalActivityPages;
    const currentPage = this.currentActivityPage;
    
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  exportToPdf(): void {
    if (!this.customerAccount) return;

    // Create a new jsPDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // Add company logo
    // Replace with your company logo path - you might need to adjust this approach based on your setup
    // For this example, I'm assuming you'll handle the logo separately and we're focusing on the layout
    // doc.addImage(this.companyLogoPath, 'PNG', margin, margin, 40, 20);
    
    // Add header with company name
    doc.setFillColor(52, 98, 169); // Blue header
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AWELLAM', pageWidth / 2, 15, { align: 'center' });
    
    // Add report title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0); // Black text
    doc.text('Customer Account Statement', pageWidth / 2, 40, { align: 'center' });
    
    const customerInfo = this.customerAccount.data.customerInfo;
    const accountSummary = this.customerAccount.data.accountSummary;
    
    // Format dates
    const fromDate = new Date(accountSummary.reportPeriod.from).toLocaleDateString();
    const toDate = new Date(accountSummary.reportPeriod.to).toLocaleDateString();
    
    // Add date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${fromDate} to ${toDate}`, pageWidth / 2, 48, { align: 'center' });
    
    // Add customer information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', margin, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${customerInfo.fullName}`, margin, 68);
    doc.text(`Email: ${customerInfo.email}`, margin, 74);
    doc.text(`Phone: ${customerInfo.phoneNumber}`, margin, 80);
    doc.text(`Address: ${customerInfo.address}`, margin, 86);
    
    // Add account summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Summary', pageWidth - margin - 60, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Orders: ${accountSummary.totalOrders}`, pageWidth - margin - 60, 68);
    doc.text(`Total Order Amount: GHS ${accountSummary.totalOrderAmount.toLocaleString()}`, pageWidth - margin - 60, 74);
    doc.text(`Total Paid: GHS ${accountSummary.totalPaid.toLocaleString()}`, pageWidth - margin - 60, 80);
    doc.text(`Current Balance: GHS ${accountSummary.currentBalance.toLocaleString()}`, pageWidth - margin - 60, 86);
    
    // Add activities table header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Activity History', margin, 100);
    
    // Draw table header
    const tableTop = 108;
    const tableHeaderHeight = 7;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, tableTop, pageWidth - margin * 2, tableHeaderHeight, 'F');
    
    // Define columns
    const colWidth = (pageWidth - margin * 2) / 6;
    
    // Set table header font
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Add table headers
    doc.text('Date', margin + 4, tableTop + 5);
    doc.text('Type', margin + colWidth, tableTop + 5);
    doc.text('Reference', margin + colWidth * 2, tableTop + 5);
    doc.text('Amount', margin + colWidth * 3, tableTop + 5);
    // doc.text('Balance Before', margin + colWidth * 4, tableTop + 5);
    doc.text('Balance After', margin + colWidth * 5, tableTop + 5);
    
    // Set table content font
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Add table rows
    let yPos = tableTop + tableHeaderHeight;
    let activitiesPerPage = 20; // Approximate number of activities per page
    let activityCount = 0;
    
    // Draw table rows
    this.activities.forEach((activity, index) => {
      // Check if we need a new page
      if (activityCount >= activitiesPerPage) {
        doc.addPage();
        yPos = margin + 10;
        activityCount = 0;
        
        // Add table header on new page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, pageWidth - margin * 2, tableHeaderHeight, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Date', margin + 4, yPos + 5);
        doc.text('Type', margin + colWidth, yPos + 5);
        doc.text('Reference', margin + colWidth * 2, yPos + 5);
        doc.text('Amount', margin + colWidth * 3, yPos + 5);
        // doc.text('Balance Before', margin + colWidth * 4, yPos + 5);
        doc.text('Balance After', margin + colWidth * 5, yPos + 5);
        
        yPos += tableHeaderHeight;
        doc.setFont('helvetica', 'normal');
      }
      
      const rowHeight = 8;
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos, pageWidth - margin * 2, rowHeight, 'F');
      }
      
      // Add row data
      doc.text(activity.displayDate || activity.formattedDate, margin + 4, yPos + 5);
      doc.text(activity.displayType, margin + colWidth, yPos + 5);
      doc.text(activity.paymentMethod || '', margin + colWidth * 2, yPos + 5);
      doc.text(`GHS ${activity.displayAmount.toLocaleString()}`, margin + colWidth * 3, yPos + 5);
      // doc.text(`GHS ${(activity.balanceBefore || 0).toLocaleString()}`, margin + colWidth * 4, yPos + 5);
      doc.text(`GHS ${(activity.balanceAfter || 0).toLocaleString()}`, margin + colWidth * 5, yPos + 5);
      
      yPos += rowHeight;
      activityCount++;
    });
    
    // Add page numbers
    // const totalPages = doc.internal.getNumberOfPages();
    // for (let i = 1; i <= totalPages; i++) {
    //   doc.setPage(i);
    //   doc.setFontSize(8);
    //   doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 10);
    // }
    
    // // Add footer on all pages
    // for (let i = 1; i <= totalPages; i++) {
    //   doc.setPage(i);
    //   doc.setFontSize(8);
    //   doc.text(`Generated on ${new Date().toLocaleDateString()} by Your Company Name`, margin, pageHeight - 10);
    // }
    
    // Save the PDF
    doc.save(`${customerInfo.fullName}_Account_Statement.pdf`);
  }

  printReport(): void {
    const printContent = document.createElement('div');
    const customerInfo = this.customerAccount.data.customerInfo;
    const accountSummary = this.customerAccount.data.accountSummary;
    const fromDate = new Date(accountSummary.reportPeriod.from).toLocaleDateString();
    const toDate = new Date(accountSummary.reportPeriod.to).toLocaleDateString();

    printContent.innerHTML = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-header { background-color: #3462a9; color: white; padding: 15px; text-align: center; margin-bottom: 20px; }
          .logo { max-height: 80px; margin-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { border: 1px solid #ddd; border-radius: 5px; padding: 15px; background-color: #f9f9f9; }
          .info-box h3 { margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          tr:nth-child(even) { background-color: #f5f5f5; }
          .footer { font-size: 10px; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }
          .text-right { text-align: right; }
          .balance-positive { color: #e53e3e; }
          .balance-negative { color: #38a169; }
        }
      </style>
      <div class="company-header">
        <h1>COMPANY NAME</h1>
      </div>
      <div class="header">
        <h1>Customer Account Statement</h1>
        <p>Period: ${fromDate} to ${toDate}</p>
      </div>
      <div class="info-grid">
        <div class="info-box">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${customerInfo.fullName}</p>
          <p><strong>Email:</strong> ${customerInfo.email}</p>
          <p><strong>Phone:</strong> ${customerInfo.phoneNumber}</p>
          <p><strong>Address:</strong> ${customerInfo.address}</p>
        </div>
        <div class="info-box">
          <h3>Account Summary</h3>
          <p><strong>Total Orders:</strong> ${accountSummary.totalOrders}</p>
          <p><strong>Total Order Amount:</strong> GHS ${accountSummary.totalOrderAmount.toLocaleString()}</p>
          <p><strong>Total Paid:</strong> GHS ${accountSummary.totalPaid.toLocaleString()}</p>
          <p><strong>Current Balance:</strong> GHS ${accountSummary.currentBalance.toLocaleString()}</p>
        </div>
      </div>
      <div class="section">
        <h2>Activity History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Details</th>
              <th class="text-right">Amount</th>
              <th class="text-right">Balance Before</th>
              <th class="text-right">Balance After</th>
            </tr>
          </thead>
          <tbody>
            ${this.activities.map(activity => `
              <tr>
                <td>${activity.displayDate || activity.formattedDate}</td>
                <td>${activity.displayType}</td>
                <td>${activity.displayReference || ''}</td>
                <td>${activity.type === 'order' ? 
                      ` ${activity.Product.join(', ')}` : 
                      activity.paymentMethod || ''}</td>
                <td class="text-right">GHS ${activity.displayAmount.toLocaleString()}</td>
                <td class="text-right ${activity.balanceBefore > 0 ? 'balance-positive' : 'balance-negative'}">
                  GHS ${(activity.balanceBefore || 0).toLocaleString()}
                </td>
                <td class="text-right ${activity.balanceAfter > 0 ? 'balance-positive' : 'balance-negative'}">
                  GHS ${(activity.balanceAfter || 0).toLocaleString()}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="footer">
        Generated on ${new Date().toLocaleDateString()} by Awellam
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent.innerHTML);
    printWindow?.document.close();
    printWindow?.print();
  }
}