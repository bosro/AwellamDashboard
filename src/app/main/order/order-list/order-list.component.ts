import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Order, OrdersService } from '../../../services/order.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  private apiUrl = `${environment.apiUrl}`;
onPlantSelect: any;

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder,
    private http: HttpClient
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
      category: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilters();
    this.loadOrders();
  }


  EditOrder(){
    
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
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm.get('plant')?.valueChanges.subscribe(plantId => {
      if (plantId) {
        this.loadCategories(plantId);
      } else {
        this.categories = [];
        this.filterForm.patchValue({ category: '' });
      }
    });
  }

  private loadCategories(plantId: string): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/category/plants/${plantId}`).subscribe({
      next: (response) => {
        this.categories = response.categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.orders.filter(order => order.status === 'PENDING');
        this.total = this.orders.length;
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
    const { search, status, paymentStatus, dateRange, minAmount, maxAmount, plant, category } = this.filterForm.value;

    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !search ||
        order.customerId.fullName.toLowerCase().includes(search.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !status || order.status === status;

      const matchesPaymentStatus = !paymentStatus || order.paymentStatus === paymentStatus;

      const matchesDateRange = (!dateRange.start || new Date(order.date) >= new Date(dateRange.start)) &&
                               (!dateRange.end || new Date(order.date) <= new Date(dateRange.end));

      const matchesAmountRange = (!minAmount || order.totalAmount >= minAmount) &&
        (!maxAmount || order.totalAmount <= maxAmount);

      const matchesPlant = !plant || order.categoryId.plantId._id === plant;
      const matchesCategory = !category || order.categoryId._id === category;

      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange && matchesAmountRange && matchesPlant && matchesCategory;
    });

    this.total = this.filteredOrders.length;
    this.filteredOrders = this.filteredOrders.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
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
    this.filterForm.reset();
    this.currentPage = 1;
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