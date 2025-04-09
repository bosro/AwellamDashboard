// self-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SelfListService } from '../../../services/selfList.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Customer {
  _id: string;
  fullName?: string;
  phoneNumber?: string;
}

interface SocNumber {
  _id: string;
  socNumber: string;
}

interface SelfListOrder {
  _id: string;
  customer: Customer;
  socNumber: SocNumber;
  truckNumber: string;
  driverName: string;
  status: string;
  createdBy?: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: SelfListOrder[];
}

@Component({
  selector: 'app-self-list',
  templateUrl: './self-list.component.html',
//   styleUrls: ['./self-list.component.css']
})
export class SelfListComponent implements OnInit {
  orders: SelfListOrder[] = [];
  isLoading = false;
  error = '';
  selectedOrder: SelfListOrder | null = null;
  showDetailsModal = false;
  showDeleteModal = false;
  showStatusModal = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  Math=Math
  
  // Search
  searchControl = new FormControl('');
  searchTerm = '';

  constructor(private selfListService: SelfListService) { }

  ngOnInit(): void {
    this.loadOrders();
    
    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.searchTerm = value || '';
        this.currentPage = 1; // Reset to first page on new search
        this.loadOrders();
      });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.selfListService.getOrders(this.currentPage, this.itemsPerPage, this.searchTerm)
      .subscribe({
        next: (response: ApiResponse) => {
          this.orders = response.data;
          this.totalItems = response.count;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load orders. Please try again.';
          this.isLoading = false;
          console.error('Error loading orders:', err);
        }
      });
  }

  openDetailsModal(order: SelfListOrder): void {
    this.selectedOrder = order;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }

  openDeleteModal(order: SelfListOrder, event: Event): void {
    event.stopPropagation(); // Prevent opening details modal
    this.selectedOrder = order;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  openStatusModal(order: SelfListOrder, event: Event): void {
    event.stopPropagation(); // Prevent opening details modal
    this.selectedOrder = order;
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
  }

  deleteOrder(): void {
    if (!this.selectedOrder) return;
    
    this.isLoading = true;
    this.selfListService.deleteOrder(this.selectedOrder._id)
      .subscribe({
        next: () => {
          this.orders = this.orders.filter(order => order._id !== this.selectedOrder?._id);
          this.totalItems--;
          this.closeDeleteModal();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete order. Please try again.';
          this.isLoading = false;
          console.error('Error deleting order:', err);
        }
      });
  }

  updateStatus(): void {
    if (!this.selectedOrder) return;
    
    this.isLoading = true;
    this.selfListService.updateOrderStatus(this.selectedOrder._id, 'completed')
      .subscribe({
        next: () => {
          const index = this.orders.findIndex(order => order._id === this.selectedOrder?._id);
          if (index !== -1) {
            this.orders[index].status = 'completed';
          }
          this.closeStatusModal();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to update order status. Please try again.';
          this.isLoading = false;
          console.error('Error updating order status:', err);
        }
      });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}