import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from '../../../services/customer.service';
import { Customer } from '../../../shared/types/customer.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscriber } from 'rxjs';
import { TransactionService } from '../../../services/transaction.service';
import { Router } from '@angular/router';
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
  filterForm!: FormGroup;
  Math = Math;
  allFilteredCustomers: Customer[] = [];

  constructor(
    private customersService: CustomersService,
    private transactionService: TransactionService,
    private fb: FormBuilder,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.createFilterForm();
    this.setupFilters();
    this.loadCustomers();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''] // Search input control
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged() // Only trigger if the search term changes
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset to first page when searching
        this.applyFilters();
      });
  }

  loadCustomers(): void {
    this.loading = true;
    this.customersService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.customers || [];
        this.total = response.total || this.customers.length; // Ensure total is set properly
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const { search } = this.filterForm.value;
    this.allFilteredCustomers = this.customers.filter(customer =>
      !search || customer.fullName.toLowerCase().includes(search.toLowerCase())
    );
    this.total = this.allFilteredCustomers.length;
    this.paginateCustomers();
  }

  paginateCustomers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredCustomers = this.allFilteredCustomers.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.total / this.pageSize)) {
      this.currentPage = page;
      this.paginateCustomers();
    }
  }

  toggleSelection(customerId: string): void {
    if (this.selectedCustomers.has(customerId)) {
      this.selectedCustomers.delete(customerId);
    } else {
      this.selectedCustomers.add(customerId);
    }
  }

  gotoDebtors(): void {
    this.route.navigate(['/main/customers/debtors']);
  }

  getDebtors(){
    this.transactionService.getDebtors().subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `debtors-list.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting debtors:', error)
    });
  }
  

  toggleAllSelection(): void {
    if (this.selectedCustomers.size === this.filteredCustomers.length) {
      this.selectedCustomers.clear();
    } else {
      this.filteredCustomers.forEach(customer => this.selectedCustomers.add(customer._id));
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