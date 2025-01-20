import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DistributionService, Distribution, DistributionStatus } from '../../../services/distribution.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-distribution-list',
  templateUrl: './distribution-list.component.html',
  styleUrls: ['./distribution-list.component.scss']
})
export class DistributionListComponent implements OnInit {
  distributions: Distribution[] = [];
  selectedOrders: Set<number> = new Set();
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  
  filterForm!: FormGroup;
  exportLoading = false;

  readonly Math = Math;
  readonly Array = Array;

  productTypes = ['42.5R', '32.5N']; // Add more as needed
  plants = ['Plant A', 'Plant B'];
  statuses: DistributionStatus[] = ['pending', 'in-transit', 'delivered', 'cancelled'];
  
  private readonly statusClasses: Record<DistributionStatus, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  constructor(
    private distributionService: DistributionService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadDistributions();
    this.setupFilterSubscription();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      productType: [''],
      plant: [''],
      status: [''],
      driver: [''],
      truck: ['']
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
        this.loadDistributions();
      });
  }

  loadDistributions(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.distributionService.getDistributions(params).subscribe({
      next: (response) => {
        this.distributions = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading distributions:', error);
        this.loading = false;
      }
    });
  }

  toggleSelection(orderId: number): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedOrders.size === this.distributions.length) {
      this.selectedOrders.clear();
    } else {
      this.distributions.forEach(order => {
        this.selectedOrders.add(order.id);
      });
    }
  }


  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.distributionService.deleteDistribution(id).subscribe({
        next: () => {
          this.selectedOrders.delete(id);
          this.loadDistributions();
        },
        error: (error) => {
          console.error('Error deleting distribution:', error);
        }
      });
    }
  }

    // Statistics methods
    getActiveDeliveries(): number {
      return this.distributions.filter(d => d.status === 'in-transit').length;
    }
  
  getCompletedToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.distributions.filter(d => {
      if (!d.actualDeliveryTime) return false;
      const deliveryDate = new Date(d.actualDeliveryTime);
      return d.status === 'delivered' && 
             deliveryDate >= today && 
             deliveryDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length;
  }

  
    getPendingOrders(): number {
      return this.distributions.filter(d => d.status === 'pending').length;
    }
  
    getAvailableDrivers(): number {
      // This should ideally come from a service
      // For now, returning a placeholder value
      return 5;
    }

  optimizeSelectedRoutes(): void {
    if (this.selectedOrders.size === 0) return;
    
    this.distributionService.optimizeDeliveryRoute(Array.from(this.selectedOrders))
      .subscribe({
        next: (optimizedRoute) => {
          // Handle optimized route
          console.log('Route optimized:', optimizedRoute);
        }
      });
  }

  getStatusClass(status: DistributionStatus): string {
    return this.statusClasses[status] || '';
  }

  exportSelected(format: 'excel' | 'pdf'): void {
    if (this.selectedOrders.size === 0) return;
    
    this.exportLoading = true;
    this.distributionService.exportDistributions(format, Array.from(this.selectedOrders))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `distribution-export.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.exportLoading = false;
        },
        error: (error) => {
          console.error('Error exporting distributions:', error);
          this.exportLoading = false;
        }
      });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDistributions();
  }
}