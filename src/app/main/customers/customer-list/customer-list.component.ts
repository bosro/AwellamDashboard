import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from '../../../services/customer.service';
import { Customer, CustomerStatus, CustomerType } from '../../../shared/types/customer.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  currentPage = 1;
  selectedCustomers = new Set<string>();
  filterForm: FormGroup;
  segments: any[] = [];
  
    // Add missing properties for dropdowns
    showStatusDropdown = false;
    showSegmentDropdown = false;
    showExportDropdown = false;
    selectedCustomerForStatus: Customer | null = null;
    
    CustomerType = CustomerType; 
    CustomerStatus = CustomerStatus;
    // Add customer statuses array for the modal
    customerStatuses = Object.values(CustomerStatus);

  Math = Math;

  constructor(
    private customersService: CustomersService,
    private fb: FormBuilder
  ) {
     this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      type: [''],
      segment: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      minSpent: [''],
      maxSpent: ['']
    });
  }

  ngOnInit(): void {
    this.setupFilters();
    this.loadCustomers();
    this.loadSegments();
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadCustomers();
      });
  }

  private loadSegments(): void {
    this.customersService.getSegments().subscribe({
      next: (segments) => {
        this.segments = segments;
      },
      error: (error) => console.error('Error loading segments:', error)
    });
  }

  loadCustomers(): void {
    this.loading = true;
    const params = {
      ...this.filterForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.customersService.getCustomers(params).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }


 showStatusOptions(customer: Customer): void {
    this.selectedCustomerForStatus = customer;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  toggleSelection(customerId: string): void {
    if (this.selectedCustomers.has(customerId)) {
      this.selectedCustomers.delete(customerId);
    } else {
      this.selectedCustomers.add(customerId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedCustomers.size === this.customers.length) {
      this.selectedCustomers.clear();
    } else {
      this.customers.forEach(customer => {
        this.selectedCustomers.add(customer.id);
      });
    }
  }

  updateCustomerStatus(customerId: string, status: CustomerStatus): void {
    this.customersService.updateCustomerStatus(customerId, status).subscribe({
      next: () => {
        this.loadCustomers();
        this.selectedCustomerForStatus = null;
      },
      error: (error) => console.error('Error updating customer status:', error)
    });
  }

  bulkUpdateStatus(status: CustomerStatus): void {
    const customerIds = Array.from(this.selectedCustomers);
    const updates = customerIds.map(id => 
      this.customersService.updateCustomerStatus(id, status)
    );

    Promise.all(updates).then(() => {
      this.selectedCustomers.clear();
      this.loadCustomers();
      this.showStatusDropdown = false;
    }).catch(error => {
      console.error('Error updating customer statuses:', error);
    });
  }


  applySegmentToSelected(segmentId: string): void {
    if (this.selectedCustomers.size === 0) return;

    this.customersService.applySegments(
      Array.from(this.selectedCustomers),
      [segmentId]
    ).subscribe({
      next: () => {
        this.selectedCustomers.clear();
        this.loadCustomers();
        this.showSegmentDropdown = false;
      },
      error: (error) => console.error('Error applying segment:', error)
    });
  }

  exportCustomers(format: 'csv' | 'excel'): void {
    const filters = this.filterForm.value;
    this.customersService.exportCustomers(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers-export.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showExportDropdown = false;
      },
      error: (error) => console.error('Error exporting customers:', error)
    });
  }


 getFullName(customer: Customer): string {
    return `${customer.personalInfo.firstName} ${customer.personalInfo.lastName}`;
  }

  getStatusClass(status: CustomerStatus): string {
    const classes = {
      [CustomerStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [CustomerStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
      [CustomerStatus.BLOCKED]: 'bg-red-100 text-red-800',
      [CustomerStatus.PENDING]: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || '';
  }

  getTypeClass(type: CustomerType): string {
    const classes = {
      [CustomerType.REGULAR]: 'bg-gray-100 text-gray-800',
      [CustomerType.VIP]: 'bg-purple-100 text-purple-800',
      [CustomerType.WHOLESALE]: 'bg-blue-100 text-blue-800',
      [CustomerType.BUSINESS]: 'bg-indigo-100 text-indigo-800'
    };
    return classes[type] || '';
  }
}