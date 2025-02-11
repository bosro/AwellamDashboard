import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Order, OrdersService } from '../../../services/order.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { PaymentService, Product } from '../../../services/payment.service';

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
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  currentPage = 1;
  selectedOrders = new Set<string>();
  filterForm: FormGroup;
  categories: Category[] = [];
  plants: Plant[] = [];
  Math = Math;
  products!: Product[];
  allOrders: Order[] = []; // Store all orders for frontend filtering

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private paymentService: PaymentService
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
      plant: [''],
      category: [''],
      product: [''] // Added product filter
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilters();
    this.loadOrders();
  }

  private loadInitialData(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/plants/get`).subscribe({
      next: (response) => {
        this.plants = response.plants;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.loading = false;
      }
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    if (plantId) {
      this.loading = true;
      this.paymentService.getProductByPlant(plantId).subscribe({
        next: (response) => {
          this.products = response.products;
          this.loading = false;
          // Reset product filter when plant changes
          this.filterForm.patchValue({ product: '' }, { emitEvent: false });
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
        },
      });
    } else {
      this.products = [];
      this.filterForm.patchValue({ product: '' }, { emitEvent: false });
      this.applyFilters();
    }
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getOrders().subscribe({
      next: (response) => {
        this.allOrders = response.orders.filter(order => order.status === 'PENDING');
        this.total = this.allOrders.length;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    // First filter the orders
    this.filteredOrders = this.allOrders.filter(order => {
      // Search filter
      const searchTerm = filters.search?.toLowerCase() || '';
      const matchesSearch = !searchTerm || 
        (order.customerId?.fullName?.toLowerCase().includes(searchTerm)) ||
        (order.orderNumber?.toLowerCase().includes(searchTerm)) ||
        (order.orderItems[0]?.product?.name?.toLowerCase().includes(searchTerm));

      // Status filter
      const matchesStatus = !filters.status || order.status === filters.status;

      // Date range filter
      const startDate = filters.dateRange?.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange?.end ? new Date(filters.dateRange.end) : null;
      const orderDate = new Date(order.date);
      const matchesDateRange = (!startDate || orderDate >= startDate) && 
        (!endDate || orderDate <= endDate);

      // Plant filter
      const matchesPlant = !filters.plant || 
        order.categoryId?.plantId?._id === filters.plant;

      // Product filter
      const matchesProduct = !filters.product || 
        order.orderItems.some(item => item.product._id === filters.product);

      return matchesSearch && matchesStatus && matchesDateRange && 
        matchesPlant && matchesProduct;
    });

    // Update total count
    this.total = this.filteredOrders.length;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredOrders = this.filteredOrders.slice(startIndex, endIndex);
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
    if (confirm('Are you sure you want to delete this order?')) {
      this.ordersService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
          this.router.navigate(['main/orders/list']);
        },
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
    this.filterForm.reset();
    this.currentPage = 1;
    this.products = [];
    this.applyFilters();
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