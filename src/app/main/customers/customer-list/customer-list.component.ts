import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from '../../../services/customer.service';
import { Customer } from '../../../shared/types/customer.interface';
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
  showStatusDropdown = false;
  showSegmentDropdown = false;
  showExportDropdown = false;


  constructor(
    private customersService: CustomersService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  ngOnInit(): void {
    this.setupFilters();
    this.loadCustomers();
  }



  getMinValue(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getMaxValue(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }


  // deleteCustomer(){

  // }

  deleteCustomer(id: string): void {
  
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customersService.deleteCustomer(id).subscribe({
        next: () => this.loadCustomers(),
        error: (error) => console.error('Error deleting order:', error)
      });
    }
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

  loadCustomers(): void {
    this.loading = true;
    const params = {
      ...this.filterForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.customersService.getCustomers(params).subscribe({
      next: (response) => {
        this.customers = response.customers;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
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
        this.selectedCustomers.add(customer._id);
      });
    }
  }

  getFullName(customer: Customer): string {
    return customer.fullName;
  }
}
