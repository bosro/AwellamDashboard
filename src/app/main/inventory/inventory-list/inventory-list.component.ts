// inventory-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryItem, InventoryService } from '../../../services/inventory.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// 

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  selectedItems: Set<number> = new Set();
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  
  filterForm!: FormGroup;
  exportLoading = false;
  showDisbursementModal = false;
  selectedItem!: InventoryItem ;

  stockTypes = ['tires', 'oils', 'rims', 'batteries'];
  locations = ['Warehouse A', 'Warehouse B', 'Storage C'];

  // Add Math property to be used in template
  protected readonly Math = Math;

  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadInventory();
    this.setupFilterSubscription();
  }

  getLowStockCount(): number {
    return this.inventoryItems.filter(item => item.status === 'low-stock').length;
  }

  getOutOfStockCount(): number {
    return this.inventoryItems.filter(item => item.status === 'out-of-stock').length;
  }

  getTotalStockValue(): number {
    return this.inventoryItems.reduce((total, item) => 
      total + (item.quantity * item.unitPrice), 0);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInventory();
  }

  openDisbursementDialog(item: InventoryItem): void {
    this.selectedItem = item;
    this.showDisbursementModal = true;
  }

  closeDisbursementDialog(): void {
    this.showDisbursementModal = false;
    // this.selectedItem = null;
  }

  onDisbursementSubmit(data: any): void {
    // Handle disbursement submission
    this.inventoryService.createDisbursement({
      itemId: this.selectedItem?.id,
      ...data
    }).subscribe({
      next: () => {
        this.closeDisbursementDialog();
        this.loadInventory();
      },
      error: (error) => {
        console.error('Error creating disbursement:', error);
      }
    });
  }

  async deleteItem(itemId: number): Promise<void> {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await this.inventoryService.deleteInventoryItem(itemId).toPromise();
        this.loadInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      stockType: [''],
      location: [''],
      status: [''],
      minimumQuantity: ['']
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
        this.loadInventory();
      });
  }

  loadInventory(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.inventoryService.getInventoryItems(params).subscribe({
      next: (response) => {
        // Now this should work without type errors
        this.inventoryItems = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
        this.loading = false;
      }
    });
  }

  toggleSelection(itemId: number): void {
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedItems.size === this.inventoryItems.length) {
      this.selectedItems.clear();
    } else {
      this.inventoryItems.forEach(item => {
        if (item.id) {
          this.selectedItems.add(item.id);
        }
      });
    }
  }

  exportSelected(format: 'excel' | 'pdf'): void {
    if (this.selectedItems.size === 0) return;
    
    this.exportLoading = true;
    this.inventoryService.exportInventory(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory-export.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.exportLoading = false;
      },
      error: (error) => {
        console.error('Error exporting inventory:', error);
        this.exportLoading = false;
      }
    });
  }



  getStatusClass(status: StockStatus): string {
    const classes: Record<StockStatus, string> = {
      'in-stock': 'bg-green-100 text-green-800',
      'low-stock': 'bg-yellow-100 text-yellow-800',
      'out-of-stock': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }

  clearFilters(): void {
    this.filterForm.reset();
  }
}