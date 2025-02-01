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
  customers: Customer[] = []; // Full list of customers
  filteredCustomers: Customer[] = []; // Customers to display after filtering
  loading = false;
  total = 0;
  pageSize = 10;
  currentPage = 1;
  selectedCustomers = new Set<string>();
  filterForm: FormGroup;
Math= Math
  constructor(
    private customersService: CustomersService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''], // Search input control
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

  private setupFilters(): void {
    // Listen for changes in the search input
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged() // Only trigger if the search term changes
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset to the first page when searching
        this.applyFilters(); // Apply filters based on the search term
      });
  }

  loadCustomers(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.customersService.getCustomers(params).subscribe({
      next: (response) => {
        this.customers = response.customers; // Store the full list of customers
        this.total = response.total || 0; // Ensure total is set properly
        this.applyFilters(); // Apply filters after loading
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const { search, status, dateRange } = this.filterForm.value;

    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = !search || customer.fullName.toLowerCase().includes(search.toLowerCase());
      // const matchesStatus = !status || customer.status === status;
      const matchesDateRange = (!dateRange.start || new Date(customer.createdAt) >= new Date(dateRange.start)) &&
                               (!dateRange.end || new Date(customer.createdAt) <= new Date(dateRange.end));

      return matchesSearch  && matchesDateRange;
    });

    this.total = this.filteredCustomers.length; // Update total for pagination
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  toggleSelection(customerId: string): void {
    if (this.selectedCustomers.has(customerId)) {
      this.selectedCustomers.delete(customerId);
    } else {
      this.selectedCustomers.add(customerId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedCustomers.size === this.filteredCustomers.length) {
      this.selectedCustomers.clear();
    } else {
      this.filteredCustomers.forEach(customer => {
        this.selectedCustomers.add(customer._id);
      });
    }
  }

  getFullName(customer: Customer): string {
    return customer.fullName;
  }

  getMinValue(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getMaxValue(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  deleteCustomer(id: string): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customersService.deleteCustomer(id).subscribe({
        next: () => this.loadCustomers(),
        error: (error) => console.error('Error deleting customer:', error)
      });
    }
  }
}