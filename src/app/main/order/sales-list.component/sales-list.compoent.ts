import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Order, OrdersService } from '../../../services/order.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { Product, ProductsService } from '../../../services/products.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

interface Category {
  _id: string;
  name: string;
}

interface Plant {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-order-list',
  templateUrl: './sales-list.component.html'
})
export class SalesOrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: any[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  currentPage = 1;
  selectedOrders = new Set<string>();
  filterForm: FormGroup;
  categories: Category[] = [];
  plants: Plant[] = [];
  Math = Math;
  products: Product[] = [];
  allOrders: Order[] = []; // Keep this for backward compatibility

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private paymentService: PaymentService,
    private productsService: ProductsService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      paymentStatus: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      minAmount: [''],
      maxAmount: [''],
      plantId: [''],
      category: [''],
      productId: ['']
    });
  }

  ngOnInit(): void {
    this.loading = true; // Start with loading state active
    this.loadInitialData();
    this.setupFilters();
  }

  private loadInitialData(): void {
    this.loading = true;
    
    // Load plants first
    this.http.get<any>(`${this.apiUrl}/plants/get`)
      .subscribe({
        next: (response) => {
          this.plants = response.plants;
          // After plants load, load the initial orders
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error loading plants:', error);
          this.loading = false;
          Swal.fire('Error', 'Failed to load plant data. Please refresh the page.', 'error');
        }
      });
  }

  private loadProducts(plantId: string): void {
    this.loading = true;
    this.productsService.getProductByPlant(plantId)
      .pipe(finalize(() => {
        // Don't turn off loading here, as we'll be loading orders next
      }))
      .subscribe({
        next: (response) => {
          this.products = response.products;
          // If we have a plantId, load the orders for that plant
          this.loadPlantOrders(plantId);
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
          Swal.fire('Error', 'Failed to load product data.', 'error');
        }
      });
  }

  toArray(value: any): any[] {
    if (!value) return []; // Return empty array if value is null/undefined
    return Array.isArray(value) ? value : [value]; // Convert object to array
  }

  private loadPlantOrders(plantId: string): void {
    this.loading = true;
    this.ordersService.getPlantOrders(plantId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: { orders: Order[] }) => {
          this.allOrders = response.orders.filter(order => order.status === 'DELIVERED');
          this.total = this.allOrders.length;
          this.applyFilters();
        },
        error: (error: any) => {
          console.error('Error loading plant orders:', error);
          Swal.fire('Error', 'Failed to load orders for this plant.', 'error');
        }
      });
  }

  private loadProductOrders(productId: string): void {
    this.loading = true;
    this.ordersService.getProductOrders(productId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.allOrders = response.orders.filter(order => order.status === 'DELIVERED');
          this.total = this.allOrders.length;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading product orders:', error);
          Swal.fire('Error', 'Failed to load orders for this product.', 'error');
        }
      });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500), // Increased from 300ms to reduce API calls during typing
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    // Clear products when plant changes
    this.products = [];
    
    if (plantId) {
      this.loading = true;
      // Load products for the selected plant
      this.loadProducts(plantId);
    } else {
      // If no plant selected, load all orders
      this.loadOrders();
    }
  }

  onProductSelect(event: any): void {
    const productId = event.target.value;
    if (productId) {
      this.loadProductOrders(productId);
    } else {
      // If product selection is cleared, fall back to plant orders or all orders
      const plantId = this.filterForm.get('plantId')?.value;
      if (plantId) {
        this.loadPlantOrders(plantId);
      } else {
        this.loadOrders();
      }
    }
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getDelieveredOrders()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.allOrders = response.orders;
          this.total = this.allOrders.length;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          Swal.fire('Error', 'Failed to load orders. Please try again.', 'error');
        }
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    if (!this.allOrders || this.allOrders.length === 0) {
      this.filteredOrders = [];
      this.total = 0;
      return;
    }

    let filtered = [...this.allOrders];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerId?.fullName?.toLowerCase().includes(searchTerm) ||
        order.orderNumber?.toLowerCase().includes(searchTerm) ||
        order.orderItems.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus) {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        return (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
      });
    }

    // Amount filter
    if (filters.minAmount) {
      filtered = filtered.filter(order => order.totalAmount >= filters.minAmount);
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(order => order.totalAmount <= filters.maxAmount);
    }

    // Product filter
    if (filters.product) {
      filtered = filtered.filter(order => 
        order.orderItems.some(item => item.product._id === filters.product)
      );
    }

    this.filteredOrders = filtered;
    this.total = filtered.length;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredOrders = filtered.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  toggleSelection(orderId: string): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }

  deleteOrder(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.ordersService.deleteOrder(id)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.loadOrders();
              Swal.fire(
                'Deleted!',
                'The order has been deleted.',
                'success'
              );
            },
            error: (error) => {
              console.error('Error deleting order:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the order.',
                'error'
              );
            }
          });
      }
    });
  }

  toggleStatus(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to change the status of this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.ordersService.toggleOrderDeliveredStatus(id)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.loadOrders();
              Swal.fire(
                'Updated!',
                'The order status has been changed.',
                'success'
              );
            },
            error: (error) => {
              console.error('Error toggling status:', error);
              Swal.fire(
                'Error!',
                'There was an error updating the order status.',
                'error'
              );
            }
          });
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.products = [];
    this.loadOrders(); // Reload all orders when clearing filters
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