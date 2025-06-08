import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvoiceService } from '../../../services/invoice.service';
import { Product, InvoiceFormData, CompanyInfo } from '../../../shared/types/invoice-types';

declare const html2pdf: any;

@Component({
  selector: 'app-invoice-generator',
  templateUrl: './invoice-component.html',
//   styleUrls: ['./invoice-generator.component.css']
})
export class InvoiceGeneratorComponent implements OnInit {
  invoiceForm: FormGroup;
  showPreview = false;
  showAllInvoices = false;
  invoiceData: any;
  allInvoices: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoading = false;
  isSaving = false;
  isLoadingInvoices = false;
  isProductDropdownOpen = false;
  
  // VAT rate (Ghana VAT is typically 15% as per the sample)
  readonly VAT_RATE = 15.0;
  
  // Fixed company information
  readonly companyInfo: any = {
    name: 'AWELLAM COMPANY LIMITED',
    poBox: 'P.O Box SC 349',
    city: 'Tema',
    country: 'Ghana',
    phone: 'Tel: +233 244541775 / +233 207046620',
    email: 'Email: awellamghana@gmail.com',
    bankDetails: 'Bankers: Stanbik Bank Ghana, Tema Industrial Area'
  };

  // Private property to store calculated values
  private calculatedValues: any = {
    netAmount: 0,
    vatAmount: 0,
    finalAmount: 0
  };

  // Generate unique invoice number in format 2025/02276
  get invoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${year}/${random}`;
  }

  get currentDate(): string {
    const date = new Date();
    const day = date.getDate();
    const suffix = this.getOrdinalSuffix(day);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).replace(/\d+/, `${day}${suffix}`);
  }

  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService
  ) {
    this.invoiceForm = this.fb.group({
      companyLogoPath: [''],
      customerName: ['', Validators.required],
      customerAddress: [''],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      vatRate: [this.VAT_RATE],
      vatExclusive: [true] // Toggle for VAT inclusive/exclusive pricing
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupFormSubscriptions();
    // Calculate initial totals
    this.calculateTotals();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.invoiceService.getProducts({ inStock: true }).subscribe({
      next: (response) => {
        this.products = response.products || response || [];
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
        this.filteredProducts = [];
        this.isLoading = false;
      }
    });
  }

  setupFormSubscriptions(): void {
    // Watch for changes in quantity, unit price, or VAT rate
    this.invoiceForm.get('quantity')?.valueChanges.subscribe(() => this.calculateTotals());
    this.invoiceForm.get('unitPrice')?.valueChanges.subscribe(() => this.calculateTotals());
    this.invoiceForm.get('vatRate')?.valueChanges.subscribe(() => this.calculateTotals());
    this.invoiceForm.get('vatExclusive')?.valueChanges.subscribe(() => this.calculateTotals());
    
    // Filter products based on description input
    this.invoiceForm.get('description')?.valueChanges.subscribe((value) => {
      this.filterProducts(value);
    });
  }

  filterProducts(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredProducts = [...this.products];
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
  }

  selectProduct(product: Product): void {
    this.invoiceForm.patchValue({
      description: product.name,
      unitPrice: product.costprice 
    });
    this.isProductDropdownOpen = false;
    this.calculateTotals();
  }

  calculateTotals(): void {
    const quantity = Number(this.invoiceForm.get('quantity')?.value) || 0;
    const unitPrice = Number(this.invoiceForm.get('unitPrice')?.value) || 0;
    const vatRate = Number(this.invoiceForm.get('vatRate')?.value) || 0;
    const isVatExclusive = this.invoiceForm.get('vatExclusive')?.value;
    
    let netAmount = quantity * unitPrice;
    let vatAmount = 0;
    let finalAmount = netAmount;
    
    if (isVatExclusive) {
      // VAT is added to the net amount
      vatAmount = (netAmount * vatRate) / 100;
      finalAmount = netAmount + vatAmount;
    } else {
      // VAT is included in the unit price
      finalAmount = netAmount;
      netAmount = finalAmount / (1 + vatRate / 100);
      vatAmount = finalAmount - netAmount;
    }
    
    // Round to 2 decimal places
    this.calculatedValues = {
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100
    };
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      this.calculateTotals();
      const formValue = this.invoiceForm.value;
      
      this.invoiceData = {
        customerName: formValue.customerName,
        customerAddress: formValue.customerAddress,
        description: formValue.description,
        quantity: formValue.quantity,
        unitPrice: formValue.unitPrice,
        vatRate: formValue.vatRate,
        netAmount: this.calculatedValues.netAmount,
        vatAmount: this.calculatedValues.vatAmount,
        finalAmount: this.calculatedValues.finalAmount,
        vatExclusive: formValue.vatExclusive
      };
      
      this.showPreview = true;
      this.showAllInvoices = false;
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach(key => {
      this.invoiceForm.get(key)?.markAsTouched();
    });
  }

  downloadPDF(): void {
    const element = document.getElementById('invoice-content');
    
    // Configure html2pdf options for exact PDF matching
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `proforma-invoice-${this.invoiceNumber.replace('/', '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: 1123
      },
      jsPDF: { 
        unit: 'px', 
        format: [794, 1123],
        orientation: 'portrait',
        hotfixes: ['px_scaling']
      },
      pagebreak: { mode: 'avoid-all', before: '#page-break' }
    };

    if (element) {
      // Add print styles before generating PDF
      this.addPrintStyles();
      
      html2pdf().set(opt).from(element).save().then(() => {
        // Remove print styles after PDF generation
        this.removePrintStyles();
      }).catch((error: any) => {
        console.error('Error generating PDF:', error);
        this.removePrintStyles();
      });
    }
  }

  printInvoice(): void {
    // Get the invoice content
    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;

    // Clone the invoice content
    const clonedContent = invoiceContent.cloneNode(true) as HTMLElement;
    
    // Create the print document with compact styling
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proforma Invoice - ${this.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.2;
            color: black;
            background: white;
            padding: 15px;
          }
          
          @page {
            size: A4;
            margin: 0.3in;
          }
          
          /* Compact header */
          .invoice-header {
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          
          /* Company logo and name */
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
          }
          
          .logo-placeholder {
            width: 40px;
            height: 40px;
            display: flex;
            margin-right: 12px;
          }
          
          .logo-stripe {
            width: 4px;
            height: 100%;
          }
          
          .logo-center {
            width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14pt;
            color: white;
          }
          
          .bg-green-500 { background-color: #10b981; }
          .bg-blue-600 { background-color: #2563eb; }
          .bg-yellow-500 { background-color: #eab308; }
          .bg-orange-500 { background-color: #f97316; }
          .bg-gray-800 { background-color: #1f2937; }
          
          h1 {
            font-size: 18pt;
            font-weight: bold;
            margin: 0;
          }
          
          /* Compact company address */
          .company-address {
            text-align: center;
            margin-bottom: 8px;
            font-size: 9pt;
            line-height: 1.1;
          }
          
          /* Invoice title */
          .invoice-title {
            text-align: center;
            margin-bottom: 8px;
          }
          
          .invoice-title h2 {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          /* Ref and date */
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 9pt;
            font-weight: 500;
          }
          
          /* Bill to section */
          .bill-to {
            margin-bottom: 10px;
          }
          
          .bill-to h3 {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 3px;
          }
          
          .bill-to p {
            font-size: 9pt;
            margin: 1px 0;
          }
          
          /* Compact table */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
            font-size: 9pt;
          }
          
          table, th, td {
            border: 1.5px solid black;
          }
          
          th, td {
            padding: 4px 3px;
            text-align: center;
            vertical-align: middle;
          }
          
          th {
            font-weight: bold;
            background-color: white;
            font-size: 8pt;
            line-height: 1.1;
          }
          
          td {
            font-size: 9pt;
          }
          
          /* Summary rows */
          .summary-row td {
            padding: 2px 3px;
            font-size: 8pt;
          }
          
          .total-row {
            font-weight: bold;
          }
          
          .total-row td {
            padding: 4px 3px;
            font-size: 10pt;
          }
          
          /* Compact footer */
          .invoice-footer {
            margin-top: 10px;
            text-align: center;
            font-size: 8pt;
            page-break-inside: avoid;
          }
          
          .footer-line {
            margin: 6px 0;
          }
          
          .colorful-line {
            height: 2px;
            display: flex;
            max-width: 300px;
            margin: 4px auto;
          }
          
          .colorful-line div {
            flex: 1;
          }
          
          /* Text utilities */
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .font-medium { font-weight: 500; }
          
          /* Hide elements by class */
          .no-print { display: none !important; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <!-- Company logo and name -->
          <div class="logo-section">
            <div class="logo-placeholder">
              <div class="logo-stripe bg-green-500"></div>
              <div class="logo-stripe bg-blue-600"></div>
              <div class="logo-stripe bg-yellow-500"></div>
              <div class="logo-stripe bg-orange-500"></div>
              <div class="logo-center bg-gray-800">A</div>
            </div>
            <h1>${this.companyInfo.name}</h1>
          </div>
          
          <!-- Company address -->
          <div class="company-address">
            <p>${this.companyInfo.poBox}, ${this.companyInfo.city}, ${this.companyInfo.country}</p>
            <p>${this.companyInfo.phone.replace('Tel: ', '')}</p>
            <p>${this.companyInfo.email.replace('Email: ', '')}</p>
          </div>
          
          <!-- Invoice title -->
          <div class="invoice-title">
            <h2>PROFORMA INVOICE</h2>
          </div>
          
          <!-- Ref and date -->
          <div class="invoice-details">
            <div>Ref: ${this.invoiceNumber}</div>
            <div>${this.currentDate}</div>
          </div>
          
          <!-- Bill to -->
          <div class="bill-to">
            <h3>BILL TO:</h3>
            <p class="font-bold">${this.invoiceData?.customerName || ''}</p>
            ${this.invoiceData?.customerAddress ? `<p>${this.invoiceData.customerAddress}</p>` : ''}
          </div>
        </div>
        
        <!-- Table -->
        <table>
          <thead>
            <tr>
              <th>QTY</th>
              <th>DESCRIPTION<br/>(50kg)</th>
              <th>UNIT<br/>PRICE</th>
              <th>NET<br/>AMOUNT<br/>VAT<br/>EXCLUSIVE<br/>(GHS)</th>
              <th>FINAL<br/>AMOUNT<br/>(GHS)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${this.formatQuantity(this.invoiceData?.quantity || 0)}</td>
              <td>${this.invoiceData?.description || ''}</td>
              <td>${this.formatCurrency(this.invoiceData?.unitPrice || 0)}</td>
              <td>${this.formatCurrency(this.invoiceData?.netAmount || 0)}</td>
              <td>${this.formatCurrency(this.invoiceData?.finalAmount || 0)}</td>
            </tr>
            <tr class="summary-row">
              <td colspan="3"></td>
              <td class="text-right font-medium">Total Net Amount</td>
              <td class="font-medium">${this.formatCurrency(this.invoiceData?.netAmount || 0)}</td>
            </tr>
            <tr class="summary-row">
              <td colspan="3"></td>
              <td class="text-right">GETF/NHIL/CVD 6%</td>
              <td>0.00</td>
            </tr>
            <tr class="summary-row">
              <td colspan="3"></td>
              <td class="text-right">VAT ${this.invoiceData?.vatRate || 0}%</td>
              <td>${this.formatCurrency(this.invoiceData?.vatAmount || 0)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3"></td>
              <td class="text-right">Total</td>
              <td>${this.formatCurrency(this.invoiceData?.finalAmount || 0)}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer -->
        <div class="invoice-footer">
          <p class="footer-line font-medium">P.O Box SC 349, Tema - Ghana &nbsp;&nbsp;&nbsp; Tel: +233 244541775 / +233 207046620 &nbsp;&nbsp;&nbsp; Email: awellamghana@gmail.com</p>
          <div class="colorful-line">
            <div class="bg-green-500"></div>
            <div class="bg-blue-600"></div>
            <div class="bg-yellow-500"></div>
            <div class="bg-orange-500"></div>
          </div>
          <p class="footer-line font-medium">Bankers: Stanbik Bank Ghana, Tema Industrial Area</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  }

  private addPrintStyles(): void {
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        /* Hide everything first */
        body * {
          visibility: hidden;
        }
        
        /* Show only the invoice content */
        #invoice-content, #invoice-content * {
          visibility: visible;
        }
        
        /* Reset body and html for print */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          background: white !important;
          font-size: 12pt !important;
        }
        
        /* Position invoice content */
        #invoice-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 20px !important;
          box-shadow: none !important;
          border: none !important;
          background: white !important;
        }
        
        /* Ensure proper page sizing */
        @page {
          size: A4;
          margin: 0.5in;
        }
        
        /* Hide action buttons and navigation */
        .action-buttons,
        .no-print,
        nav,
        header,
        .navbar,
        .header,
        .search,
        .sidebar {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Ensure footer is visible */
        .invoice-footer {
          page-break-inside: avoid;
          margin-top: auto;
        }
        
        /* Table styling for print */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          page-break-inside: auto;
        }
        
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        
        th, td {
          border: 1px solid black !important;
          padding: 8px !important;
          text-align: center !important;
        }
        
        /* Header styling */
        .invoice-header {
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        
        /* Ensure text is visible */
        * {
          color: black !important;
          background: transparent !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private removePrintStyles(): void {
    const style = document.getElementById('print-styles');
    if (style) {
      style.remove();
    }
  }

  saveInvoice(): void {
    if (!this.invoiceData) return;
    
    this.isSaving = true;
    
    const invoiceRequest: any = {
      customerName: this.invoiceData.customerName,
      customerAddress: this.invoiceData.customerAddress,
      description: this.invoiceData.description,
      quantity: this.invoiceData.quantity,
      unitPrice: this.invoiceData.unitPrice,
      netAmount: this.invoiceData.netAmount,
      vatRate: this.invoiceData.vatRate,
      vatAmount: this.invoiceData.vatAmount,
      finalAmount: this.invoiceData.finalAmount,
      invoiceNumber: this.invoiceNumber,
      invoiceDate: new Date().toISOString(),
      vatExclusive: this.invoiceData.vatExclusive
    };
    
    this.invoiceService.saveInvoice(invoiceRequest).subscribe({
      next: (response) => {
        console.log('Invoice saved successfully:', response);
        alert('Invoice saved successfully!');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice. Please try again.');
        this.isSaving = false;
      }
    });
  }

  editInvoice(): void {
    this.showPreview = false;
    this.showAllInvoices = false;
  }

  createNewInvoice(): void {
    this.invoiceForm.reset({
      companyLogoPath: '',
      quantity: 1,
      vatRate: this.VAT_RATE,
      vatExclusive: true
    });
    this.invoiceData = null;
    this.showPreview = false;
    this.showAllInvoices = false;
    this.isProductDropdownOpen = false;
    this.calculatedValues = {
      netAmount: 0,
      vatAmount: 0,
      finalAmount: 0
    };
  }

  // Logo path method
  getLogoPath(): string {
    const logoPath = this.invoiceForm.get('companyLogoPath')?.value;
    return logoPath || 'assets/images/logo.png';
  }

  // Formatting methods
  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '0.00';
    return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatQuantity(quantity: number): string {
    if (quantity === null || quantity === undefined) return '0';
    // Format without decimal places if it's a whole number
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    // Show up to 2 decimal places for fractional quantities
    return quantity.toFixed(2).replace(/\.?0+$/, '');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = this.getOrdinalSuffix(day);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).replace(/\d+/, `${day}${suffix}`);
  }

  // Invoice management methods
  viewAllInvoices(): void {
    this.showPreview = false;
    this.showAllInvoices = true;
    this.loadAllInvoices();
  }

  hideAllInvoices(): void {
    this.showAllInvoices = false;
  }

  loadAllInvoices(): void {
    this.isLoadingInvoices = true;
    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.allInvoices = invoices || [];
        this.isLoadingInvoices = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.allInvoices = [];
        this.isLoadingInvoices = false;
      }
    });
  }

  viewInvoice(invoice: any): void {
    this.invoiceData = { ...invoice };
    this.showAllInvoices = false;
    this.showPreview = true;
  }

  editExistingInvoice(invoice: any): void {
    this.invoiceForm.patchValue({
      companyLogoPath: invoice.companyLogoPath || '',
      customerName: invoice.customerName || '',
      customerAddress: invoice.customerAddress || '',
      description: invoice.description || '',
      quantity: invoice.quantity || 1,
      unitPrice: invoice.unitPrice || 0,
      vatRate: invoice.vatRate || this.VAT_RATE,
      vatExclusive: invoice.vatExclusive !== undefined ? invoice.vatExclusive : true
    });
    
    // Update calculated values
    this.calculateTotals();
    this.showAllInvoices = false;
    this.showPreview = false;
  }

  // Product dropdown methods
  toggleProductDropdown(): void {
    this.isProductDropdownOpen = !this.isProductDropdownOpen;
  }

  onDescriptionClick(): void {
    this.isProductDropdownOpen = true;
  }

  onDescriptionBlur(): void {
    // Add a small delay to allow for product selection
    setTimeout(() => {
      this.isProductDropdownOpen = false;
    }, 200);
  }
}