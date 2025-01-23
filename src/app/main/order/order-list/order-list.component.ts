import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdersService } from '../../../services/order.service';
import { Order, OrderStatus, PaymentStatus, OrderResponse } from '../../../shared/types/order.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  currentPage = 1;
  selectedOrders = new Set<string>();
  filterForm: FormGroup;
  Math = Math;
  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;

  showExportDropdown = false;

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder
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
      maxAmount: ['']
    });
  }

  ngOnInit(): void {
    this.setupFilters();
    this.loadOrders();
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadOrders();
      });
  }

  loadOrders(): void {
    this.loading = true;
    const params = {
      ...this.filterForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.ordersService.getOrders(params).subscribe({
      next:(response) => {
        this.orders = response.orders;
        // this.total = response.orders.length;
        this.loading = false;
        console.log(this.orders)
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  toggleSelection(orderId: string): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedOrders.size === this.orders.length) {
      this.selectedOrders.clear();
    } else {
      this.orders.forEach(order => this.selectedOrders.add(order._id));
    }
  }

  bulkUpdateStatus(status: OrderStatus): void {
    if (this.selectedOrders.size === 0) return;

    this.ordersService.bulkUpdateStatus(Array.from(this.selectedOrders), status)
      .subscribe({
        next: () => {
          this.selectedOrders.clear();
          this.loadOrders();
        },
        error: (error) => console.error('Error updating status:', error)
      });
  }

  exportOrders(format: 'csv' | 'excel'): void {
    const filters = this.filterForm.value;
    this.ordersService.exportOrders(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-export.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showExportDropdown = false;
      },
      error: (error) => console.error('Error exporting orders:', error)
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadOrders();
  }

  processOrder(orderId: string): void {
    this.ordersService.updateOrderStatus(orderId, OrderStatus.PROCESSING).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => console.error('Error processing order:', error)
    });
  }

  canRefund(order: Order): boolean {
    return (
      order.status === OrderStatus.DELIVERED &&
      order.paymentStatus === PaymentStatus.PAID
    );
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