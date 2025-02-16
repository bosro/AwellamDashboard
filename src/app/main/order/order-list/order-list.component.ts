import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Order, OrdersService } from '../../../services/order.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { Product, ProductsService } from '../../../services/products.service';
import { forkJoin } from 'rxjs';

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
  pageSize = 15;
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
    // this.loadInitialData();
    this.setupFilters();
    this.loadOrders();
    // this.loadProducts();
  }

  private loadInitialData(): void {
    this.loading = true;
    
    forkJoin({
      plants: this.http.get<any>(`${this.apiUrl}/plants/get`),
    }).subscribe({
      next: ({ plants }) => {
        this.plants = plants.plants;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.loading = false;
      }
    });
  }

  // private loadProducts(): void {
  //   this.productsService.getProducts({}).subscribe({
  //     next: (response) => {
  //       this.products = response.products;
  //       this.total = this.products.length;
  //       this.applyFilters();
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading products:', error);
  //       this.loading = false;
  //     }
  //   });
  // }

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
      this.productsService.getProductByPlant(plantId).subscribe({
        next: (response: { products: Product[] }) => {
          this.products = response.products;
          this.total = this.products.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading products:', error);
          this.loading = false;
        }
      });
      this.ordersService.getPlantOrders(plantId).subscribe({
        next: (response: { orders: Order[] }) => {
          this.allOrders = response.orders.filter(order => order.status === 'PENDING');
          this.total = this.allOrders.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading orders:', error);
          this.loading = false;
        }
      });
      
    }
    
  }

  onProductSelect(event: any): void {
    const productId = event.target.value;
    if (productId) {
      this.loading = true;
      this.ordersService.getProductOrders(productId).subscribe({
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
  }

  

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getPendingOrders().subscribe({
      next: (response) => {
        this.allOrders = response.orders;
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
    this.total = this.filteredOrders.length;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredOrders = filtered.slice(startIndex, endIndex);
  }

  // Rest of the component remains the same...
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