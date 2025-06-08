// customer-receipts.component.ts
import { Component, OnInit } from '@angular/core';
import { Receipt, ReceiptService } from '../../../services/receipt.service';

@Component({
  selector: 'app-customer-receipts',
  templateUrl: './customer-receipts.component.html'
})
export class CustomerReceiptsComponent implements OnInit {
  receipts: Receipt[] = [];
  loading = false;
  error = '';
  selectedReceipt: Receipt | null = null;
  updatingStatus = false;
  imageLoadError = false;
  statusFilter: string = 'all'; // all, pending, approved, rejected
  searchTerm: string = '';

  constructor(private receiptService: ReceiptService) {}

  ngOnInit() {
    this.loadAllReceipts();
    console.log('CustomerReceiptsComponent initialized - loading all receipts');
  }

  loadAllReceipts() {
    this.loading = true;
    this.error = '';
    console.log('Loading all receipts');

    this.receiptService.getAllReceipts().subscribe({
      next: (res) => {
        console.log('All receipts response:', res);
        
        // Handle the API response structure: { "receipts": [...] }
        if (res && res.receipts && Array.isArray(res.receipts)) {
          this.receipts = res.receipts;
        } else {
          this.receipts = [];
        }
        
        this.loading = false;
        console.log('Loaded all receipts:', this.receipts);
      },
      error: (err) => {
        console.error('Error loading all receipts:', err);
        this.error = `Failed to load all receipts: ${err.message || 'Unknown error'}`;
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
        // Find and update the specific receipt in the original array
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

  // Customer information helpers for the API structure
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

  // Statistics helpers
  getApprovedCount(): number {
    return this.receipts.filter(receipt => receipt.status?.toLowerCase() === 'approved').length;
  }

  getPendingCount(): number {
    return this.receipts.filter(receipt => receipt.status?.toLowerCase() === 'pending').length;
  }

  getRejectedCount(): number {
    return this.receipts.filter(receipt => receipt.status?.toLowerCase() === 'rejected').length;
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

  retry() {
    this.loadAllReceipts();
  }
}