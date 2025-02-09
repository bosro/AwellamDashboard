import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PurchasingService, Purchase } from '../../../services/purchasing.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchasing-detail.component.html'
})
export class PurchaseDetailComponent implements OnInit {
  purchases: Purchase[] = [];
  filteredPurchases: Purchase[] = [];
  selectedPurchases: Set<string> = new Set();
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  
  filterForm!: FormGroup;
  exportLoading = false;

  productTypes: string[] = ['Type A', 'Type B', 'Type C'];
  locations: string[] = ['Location 1', 'Location 2', 'Location 3'];

  Math = Math;

  constructor(
    private purchasingService: PurchasingService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadPurchases();
    this.setupFilterSubscription();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      status: [''],
      productType: [''],
      location: ['']
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  loadPurchases(): void {
    this.loading = true;
    this.purchasingService.getPurchases({})
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.purchases = response.purchases;
          this.total = this.purchases.length;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading purchases:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    const { searchTerm, dateRange, status, productType, location } = this.filterForm.value;

    this.filteredPurchases = this.purchases.filter(purchase => {
      const matchesSearch = !searchTerm || purchase.paymentReference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDateRange = (!dateRange.start || new Date(purchase.dateOfPurchase) >= new Date(dateRange.start)) &&
                               (!dateRange.end || new Date(purchase.dateOfPurchase) <= new Date(dateRange.end));
      // const matchesStatus = !status || purchase.status === status;
      // const matchesProductType = !productType || purchase.productType === productType;
      // const matchesLocation = !location || purchase.location === location;

      return matchesSearch && matchesDateRange ;
    });

    this.total = this.filteredPurchases.length;
    this.filteredPurchases = this.filteredPurchases.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  toggleSelection(purchaseId: string): void {
    if (this.selectedPurchases.has(purchaseId)) {
      this.selectedPurchases.delete(purchaseId);
    } else {
      this.selectedPurchases.add(purchaseId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedPurchases.size === this.purchases.length) {
      this.selectedPurchases.clear();
    } else {
      this.purchases.forEach(purchase => {
        if (purchase._id !== undefined) {
          this.selectedPurchases.add(purchase._id);
        }
      });
    }
  }

  exportSelected(format: 'excel' | 'pdf'): void {
    if (this.selectedPurchases.size === 0) return;
    
    this.exportLoading = true;
    this.purchasingService.exportPurchases(Array.from(this.selectedPurchases), format)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `purchases-export.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.exportLoading = false;
        },
        error: (error: Error) => {
          console.error('Error exporting purchases:', error);
          this.exportLoading = false;
        }
      });
  }

  bulkUpdateStatus(status: string): void {
    if (this.selectedPurchases.size === 0) return;

    this.purchasingService.bulkUpdateStatus(Array.from(this.selectedPurchases), status)
      .subscribe({
        next: () => {
          this.loadPurchases();
          this.selectedPurchases.clear();
        }
      });
  }

  deletePurchase(id: string): void {
    if (confirm('Are you sure you want to delete this purchase?')) {
      this.purchasingService.deletePurchase(id).subscribe({
        next: () => {
          this.loadPurchases();
          this.selectedPurchases.delete(id);
        },
        error: (error: Error) => {
          console.error('Error deleting purchase:', error);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  }

  clearFilters(): void {
    this.filterForm.reset();
  }
}