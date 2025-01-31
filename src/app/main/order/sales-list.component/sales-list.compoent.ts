import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Order, OrdersService } from '../../../services/order.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-order-list',
  templateUrl: './sales-list.component.html'
})
export class SalesOrderListComponent implements OnInit {
  orders: Order[] = []; // Full list of orders
  filteredOrders: Order[] = []; // Orders to display after filtering
  loading = false;
  total = 0; // Total number of filtered orders
  pageSize = 10; // Number of orders per page
  currentPage = 1; // Current page number
  selectedOrders = new Set<string>(); // Selected orders
  filterForm: FormGroup;

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''], // Search input
      status: [''], // Status filter
      paymentStatus: [''], // Payment status filter
      dateRange: this.fb.group({
        start: [''], // Start date
        end: [''] // End date
      }),
      minAmount: [''], // Minimum amount
      maxAmount: [''] // Maximum amount
    });
  }

  ngOnInit(): void {
    this.setupFilters();
    this.loadOrders();
  }

  private setupFilters(): void {
    // Listen for changes in the filter form
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged() // Only trigger if the value changes
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset to the first page when filters change
        this.filterOrders(); // Apply filters
      });
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.orders.filter(order => order.status === 'DELIVERED'); // Load only delivered orders
        this.filterOrders(); // Apply filters after loading
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    const filters = this.filterForm.value;

    this.filteredOrders = this.orders.filter(order => {
      // Search by customer name or order number
      const matchesSearch = !filters.search ||
        order.customerId.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(filters.search.toLowerCase());

      // Filter by status
      const matchesStatus = !filters.status || order.status === filters.status;

      // Filter by payment status
      const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;

      // Filter by date range
      const matchesDateRange = !filters.dateRange.start || !filters.dateRange.end ||
        (new Date(order.date) >= new Date(filters.dateRange.start) &&
         new Date(order.date) <= new Date(filters.dateRange.end));

      // Filter by amount range
      const matchesAmountRange = (!filters.minAmount || order.totalAmount >= filters.minAmount) &&
        (!filters.maxAmount || order.totalAmount <= filters.maxAmount);

      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange && matchesAmountRange;
    });

    this.total = this.filteredOrders.length; // Update total for pagination
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  toggleSelection(orderId: string): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedOrders.size === this.filteredOrders.length) {
      this.selectedOrders.clear();
    } else {
      this.filteredOrders.forEach(order => this.selectedOrders.add(order._id));
    }
  }

  deleteOrder(id: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.ordersService.deleteOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (error) => console.error('Error deleting order:', error)
      });
    }
  }

  toggleStatus(id: string): void {
    this.ordersService.toggleOrderStatus(id).subscribe({
      next: () => this.loadOrders(),
      error: (error) => console.error('Error toggling status:', error)
    });
  }

  clearFilters(): void {
    this.filterForm.reset(); // Reset all filters
    this.currentPage = 1; // Reset to the first page
    this.filterOrders(); // Reapply filters
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Unpaid': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-green-100 text-green-800',
      'Refunded': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}