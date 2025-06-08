// customer-receipts.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Receipt, ReceiptService } from '../../../services/receipt.service';

@Component({
  selector: 'app-customer-receipts',
  templateUrl: './customer-receipts.component.html'
})
export class CustomerReceipts implements OnInit {
  customerId!: string;
  receipts: Receipt[] = [];
  loading = false;
  error = '';
  updatingStatus = false;
  selectedReceipt: Receipt | null = null;
  imageLoadError = false;
  statusFilter: string = 'all';
  searchTerm: string = '';

  constructor(
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get customer ID from route parameters
    this.route.params.subscribe(params => {
      this.customerId = params['id']; // assuming route is /customers/receipts/:id
      if (this.customerId) {
        console.log('Loading receipts for customer ID:', this.customerId);
        this.loadReceipts();
      } else {
        this.error = 'No customer ID provided in route';
      }
    });
  }

  loadReceipts() {
    if (!this.customerId) {
      this.error = 'No customer ID provided';
      return;
    }

    this.loading = true;
    this.error = '';
    console.log('Loading receipts for customer:', this.customerId);

    this.receiptService.getReceiptsByCustomer(this.customerId).subscribe({
      next: (res) => {
        console.log('Receipt service response:', res);
        
        // Handle the API response structure
        if (res && res.receipts && Array.isArray(res.receipts)) {
          this.receipts = res.receipts;
        } else if (res && Array.isArray(res)) {
          this.receipts = res;
        } else {
          this.receipts = [];
        }
        
        this.loading = false;
        console.log('Processed receipts:', this.receipts);
        
        if (this.receipts.length === 0) {
          console.log('No receipts found for customer:', this.customerId);
        }
      },
      error: (err) => {
        console.error('Error loading receipts:', err);
        this.error = `Failed to load receipts: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.receipts = [];
      }
    });
  }

  changeStatus(receiptId: string, newStatus: string, receipt?: Receipt) {
    if (this.updatingStatus) return;

    // Show confirmation for important status changes
    if (newStatus === 'approved') {
      if (!confirm('Are you sure you want to approve this receipt?')) {
        return;
      }
    }

    this.updatingStatus = true;
    
    this.receiptService.editReceipt(receiptId, { status: newStatus }).subscribe({
      next: () => {
        // Find and update the specific receipt in the array
        const receiptIndex = this.receipts.findIndex(r => r._id === receiptId);
        if (receiptIndex !== -1) {
          this.receipts[receiptIndex].status = newStatus;
        }
        
        this.updatingStatus = false;
        console.log(`Status updated to "${newStatus}" for receipt ${receiptId}`);
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.error = 'Failed to update receipt status. Please try again.';
        this.updatingStatus = false;
        
        // Clear error after 5 seconds
        setTimeout(() => {
          this.error = '';
        }, 5000);
      }
    });
  }

  // Preview functionality
  openPreview(receipt: Receipt) {
    this.selectedReceipt = receipt;
    this.imageLoadError = false;
  }

  closePreview() {
    this.selectedReceipt = null;
    this.imageLoadError = false;
  }

  onImageError() {
    this.imageLoadError = true;
  }

  // Customer information helpers
  getCustomerName(receipt: any): string {
    if (receipt.customerId && typeof receipt.customerId === 'object' && receipt.customerId.fullName) {
      return receipt.customerId.fullName;
    }
    return 'Anonymous';
  }

  getCustomerPhone(receipt: any): string {
    if (receipt.customerId && typeof receipt.customerId === 'object' && receipt.customerId.phoneNumber) {
      return receipt.customerId.phoneNumber.toString();
    }
    return '-';
  }

  hasCustomerInfo(receipt: any): boolean {
    return receipt.customerId && typeof receipt.customerId === 'object';
  }

  // Filtering and search functionality
  getFilteredReceipts(): Receipt[] {
    let filtered = this.receipts;
    
    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(receipt => receipt.status.toLowerCase() === this.statusFilter);
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(receipt => {
        const customerName = this.getCustomerName(receipt).toLowerCase();
        const customerPhone = this.getCustomerPhone(receipt).toLowerCase();
        return customerName.includes(term) || customerPhone.includes(term);
      });
    }
    
    return filtered;
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
  }

  getFilterCount(status: string): number {
    if (status === 'all') {
      return this.receipts.length;
    }
    return this.receipts.filter(receipt => receipt.status.toLowerCase() === status).length;
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  }

  getApprovedCount(): number {
    return this.receipts.filter(receipt => receipt.status?.toLowerCase() === 'approved').length;
  }

  getPendingCount(): number {
    return this.receipts.filter(receipt => receipt.status?.toLowerCase() === 'pending').length;
  }

  getRejectedCount(): number {
    return this.receipts.filter(receipt => receipt.status?.toLowerCase() === 'rejected').length;
  }

  retry() {
    this.loadReceipts();
  }

  formatDate(date: string | Date): string {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  }

  isPdf(url: string): boolean {
    return url?.toLowerCase().includes('.pdf') || false;
  }

  // Navigation
  goBack() {
    this.router.navigate(['/main/customers']);
  }
}