import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerAccountService } from '../../../services/customer-account.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CustomersService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-summary',
  templateUrl: './customer.report.component.html'
})
export class CustomerSummaryComponent implements OnInit {
  // Data properties
  customers: any[] = [];
  customerAccount: any = null;
  loading = false;
  searchAttempted = false;
  
  // Pagination for orders
  currentOrderPage = 1;
  orderPageSize = 10;
  totalOrderPages = 0;
  
  // Pagination for transactions
  currentTransactionPage = 1;
  transactionPageSize = 10;
  totalTransactionPages = 0;
  
  // Filter form
  filterForm: FormGroup;
  
  constructor(
    private customerAccountService: CustomerAccountService,
    private customersService: CustomersService,
    private fb: FormBuilder
  ) {
    // Initialize form with default values
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
  
  /**
   * Format date to YYYY-MM-DD for form controls
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Load all customers for dropdown selection
   */
  loadCustomers(): void {
    this.loading = true;
    this.customersService.getCustomers().subscribe({
      next: (response) => {
        // Make sure we're properly handling the customer data and ID field
        this.customers = response.customers || [];
        
        // Log first customer to debug
        if (this.customers.length > 0) {
          console.log('Sample customer:', this.customers[0]);
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }
  
  /**
   * Load customer account data based on selected criteria
   */
  loadCustomerAccount(): void {
    if (this.filterForm.invalid) {
      return;
    }
    
    const values = this.filterForm.value;
    console.log('Loading customer account with ID:', values.customerId);
    
    this.loading = true;
    this.searchAttempted = true;
    
    this.customerAccountService.getCustomerAccount(
      values.customerId,
      values.startDate,
      values.endDate
    ).subscribe({
      next: (response) => {
        this.customerAccount = response;
        
        // Calculate pagination for orders
        this.totalOrderPages = Math.ceil(
          (this.customerAccount.data.orders?.length || 0) / this.orderPageSize
        );
        
        // Calculate pagination for transactions
        this.totalTransactionPages = Math.ceil(
          (this.customerAccount.data.transactions?.length || 0) / this.transactionPageSize
        );
        
        // Reset page numbers
        this.currentOrderPage = 1;
        this.currentTransactionPage = 1;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer account:', error);
        this.loading = false;
      }
    });
  }
  
  /**
   * Helper method to generate array for pagination
   */
  generatePageArray(totalPages: number): number[] {
    return new Array(totalPages).fill(0).map((_, i) => i);
  }
  
  /**
   * Get paginated orders
   */
  get paginatedOrders() {
    if (!this.customerAccount || !this.customerAccount.data.orders) {
      return [];
    }
    
    const startIndex = (this.currentOrderPage - 1) * this.orderPageSize;
    return this.customerAccount.data.orders.slice(startIndex, startIndex + this.orderPageSize);
  }
  
  /**
   * Get paginated transactions
   */
  get paginatedTransactions() {
    if (!this.customerAccount || !this.customerAccount.data.transactions) {
      return [];
    }
    
    const startIndex = (this.currentTransactionPage - 1) * this.transactionPageSize;
    return this.customerAccount.data.transactions.slice(
      startIndex, 
      startIndex + this.transactionPageSize
    );
  }
  
  /**
   * Change order page
   */
  changeOrderPage(page: number): void {
    if (page < 1 || page > this.totalOrderPages) {
      return;
    }
    this.currentOrderPage = page;
  }
  
  /**
   * Change transaction page
   */
  changeTransactionPage(page: number): void {
    if (page < 1 || page > this.totalTransactionPages) {
      return;
    }
    this.currentTransactionPage = page;
  }
  
  /**
   * Export customer data to PDF
   */
  exportToPdf(): void {
    if (!this.customerAccount) {
      return;
    }

    // Hide pagination and buttons for PDF export
    const actionButtons = document.getElementById('action-buttons');
    const paginationElements = document.querySelectorAll('.pagination');
    
    if (actionButtons) actionButtons.style.display = 'none';
    paginationElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    
    // Get the content element
    const content = document.getElementById('pdf-content');
    if (!content) {
      console.error('PDF content element not found');
      return;
    }
    
    // Show loading indicator
    this.loading = true;
    
    // Use html2canvas to capture the content
    html2canvas(content, {
      scale: 1,
      useCORS: true,
      logging: false,
      allowTaint: true
    }).then(canvas => {
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save PDF
      const customerName = this.customerAccount.data.customerInfo.fullName.replace(/\s+/g, '_');
      pdf.save(`${customerName}_Account_Summary.pdf`);
      
      // Restore UI elements
      if (actionButtons) actionButtons.style.display = 'flex';
      paginationElements.forEach(el => {
        (el as HTMLElement).style.display = 'flex';
      });
      
      this.loading = false;
    }).catch(error => {
      console.error('Error generating PDF:', error);
      this.loading = false;
      
      // Restore UI elements
      if (actionButtons) actionButtons.style.display = 'flex';
      paginationElements.forEach(el => {
        (el as HTMLElement).style.display = 'flex';
      });
    });
  }
  
  /**
   * Print the current report
   */
  printReport(): void {
    window.print();
  }
}