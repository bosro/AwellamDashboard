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
  }

  loadProducts(): void {
    this.isLoading = true;
    this.invoiceService.getProducts({ inStock: true }).subscribe({
      next: (response) => {
        this.products = response.products;
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
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
    netAmount = Math.round(netAmount * 100) / 100;
    vatAmount = Math.round(vatAmount * 100) / 100;
    finalAmount = Math.round(finalAmount * 100) / 100;
    
    // Store calculated values for preview
    this.calculatedValues = {
      netAmount,
      vatAmount,
      finalAmount
    };
  }

  private calculatedValues: any = {};

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
      margin: [15, 15, 15, 15],
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
      });
    }
  }

  printInvoice(): void {
    this.addPrintStyles();
    window.print();
    // Remove print styles after a delay to allow printing to complete
    setTimeout(() => {
      this.removePrintStyles();
    }, 1000);
  }

  private addPrintStyles(): void {
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        * {
          visibility: hidden;
        }
        #invoice-content, #invoice-content * {
          visibility: visible;
        }
        #invoice-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
        }
        
        /* Ensure proper spacing for print */
        .invoice-table {
          page-break-inside: avoid;
        }
        
        .invoice-header {
          page-break-inside: avoid;
        }
        
        .invoice-footer {
          page-break-inside: avoid;
        }
        
        /* Hide action buttons when printing */
        .action-buttons {
          display: none !important;
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
      invoiceDate: new Date().toISOString()
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
    this.calculatedValues = {};
  }

  // New methods for logo path and invoice management
  getLogoPath(): string {
    return this.invoiceForm.get('companyLogoPath')?.value || 'assets/images/logo.png';
  }

  formatCurrency(amount: number): string {
    return (amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatQuantity(quantity: number): string {
    // Format without decimal places if it's a whole number
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    // Show up to 2 decimal places for fractional quantities
    return quantity.toFixed(2).replace(/\.?0+$/, '');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB');
  }

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
        this.allInvoices = invoices;
        this.isLoadingInvoices = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.isLoadingInvoices = false;
      }
    });
  }

  viewInvoice(invoice: any): void {
    this.invoiceData = invoice;
    this.showAllInvoices = false;
    this.showPreview = true;
  }

  editExistingInvoice(invoice: any): void {
    this.invoiceForm.patchValue({
      companyLogoPath: invoice.companyLogoPath || '',
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
      description: invoice.description,
      quantity: invoice.quantity,
      unitPrice: invoice.unitPrice,
      vatRate: invoice.vatRate,
      vatExclusive: invoice.vatExclusive
    });
    this.showAllInvoices = false;
    this.showPreview = false;
  }

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