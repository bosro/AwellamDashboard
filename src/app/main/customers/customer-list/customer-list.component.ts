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
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged() // Only trigger if the search term changes
      )
      .subscribe((searchTerm) => {
        this.currentPage = 1; // Reset to the first page when searching
        this.filterCustomers(searchTerm); // Filter customers based on the search term
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
        this.filteredCustomers = response.customers; // Initialize filteredCustomers with all customers
        this.total = response.total || 0; // Ensure total is set properly
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  filterCustomers(searchTerm: string): void {
    if (!searchTerm) {
      // If the search term is empty, show all customers
      this.filteredCustomers = this.customers;
    } else {
      // Filter customers by name (case-insensitive)
      this.filteredCustomers = this.customers.filter(customer =>
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.total = this.filteredCustomers.length; // Update total for pagination
  }

  onPageChange(page: number): void {
    this.currentPage = page;
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