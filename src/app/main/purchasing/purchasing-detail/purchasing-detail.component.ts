import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PurchasingService, Purchase } from '../../../services/purchasing.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchasing-detail.component.html'
})

export class PurchaseDetailComponent implements OnInit {
  purchases: Purchase[] = [];
  selectedPurchases: Set<number> = new Set();
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
        this.loadPurchases();
      });
  }

  loadPurchases(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.purchasingService.getPurchases(params).subscribe({
      next: (response) => {
        this.purchases = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading purchases:', error);
        this.loading = false;
      }
    });
  }

  toggleSelection(purchaseId: number): void {
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
        if (purchase.id !== undefined) {
          this.selectedPurchases.add(purchase.id);
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

  deletePurchase(id: number): void {
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


  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPurchases();
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