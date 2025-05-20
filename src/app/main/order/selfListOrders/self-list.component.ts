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
  amount: string;
  price?: number;
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

interface EditFormData {
  customerId: string;
  truckNumber: string;
  driverName: string;
  price: number | null;
}

@Component({
  selector: 'app-self-list',
  templateUrl: './self-list.component.html',
//   styleUrls: ['./self-list.component.css']
})
export class SelfListComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;
  error = '';
  selectedOrder: any | null = null;
  showDetailsModal = false;
  showDeleteModal = false;
  showStatusModal = false;
  showEditModal = false;
  
  // Customer list for the dropdown
  customers: Customer[] = [];

  amount: number | null = null;
  amountError: string | null = null;
  editError: string | null = null;

  // Edit form data
  editForm: EditFormData = {
    customerId: '',
    truckNumber: '',
    driverName: '',
    price: null
  };

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
    this.loadCustomers();
    
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

  loadCustomers(): void {
    this.selfListService.getCustomers()
      .subscribe({
        next: (response: any) => {
          this.customers = response.customers;
        },
        error: (err) => {
          console.error('Error loading customers:', err);
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
    this.amount = null;
    this.amountError = null;
  }

  openEditModal(order: SelfListOrder, event: Event): void {
    event.stopPropagation(); // Prevent opening details modal
    this.selectedOrder = order;
    
    // Initialize the edit form with the selected order's data
    this.editForm = {
      customerId: order.customer._id,
      truckNumber: order.truckNumber,
      driverName: order.driverName,
      price: order.price || null
    };
    
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editError = null;
  }

  saveEditChanges(): void {
    if (!this.selectedOrder) return;
    
    // Validate form data
    if (!this.editForm.customerId) {
      this.editError = 'Please select a customer.';
      return;
    }
    
    if (!this.editForm.truckNumber) {
      this.editError = 'Please enter a truck number.';
      return;
    }
    
    if (!this.editForm.driverName) {
      this.editError = 'Please enter a driver name.';
      return;
    }
    
    this.isLoading = true;
    this.editError = null;
    
    this.selfListService.updateOrder(
      this.selectedOrder._id,
      this.editForm.customerId,
      this.editForm.truckNumber,
      this.editForm.driverName,
      this.editForm.price
    ).subscribe({
      next: (response: any) => {
        // Update the order in the local array
        const index = this.orders.findIndex(order => order._id === this.selectedOrder?._id);
        if (index !== -1 && response.data) {
          this.orders[index] = response.data;
        }
        
        this.closeEditModal();
        this.isLoading = false;
      },
      error: (err) => {
        this.editError = 'Failed to update order. Please try again.';
        this.isLoading = false;
        console.error('Error updating order:', err);
      }
    });
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
  
    // Validate the amount
    // if (!this.amount || this.amount <= 0) {
    //   this.amountError = 'Please enter a valid amount.';
    //   return;
    // }
  
    this.isLoading = true;
    this.error = ''; // Clear any previous errors
  
    // Call the service to update the order status with the amount
    this.selfListService.updateOrderStatus(this.selectedOrder._id, 'completed',)
      .subscribe({
        next: () => {
          const index = this.orders.findIndex(order => order._id === this.selectedOrder?._id);
          if (index !== -1) {
            this.orders[index].status = 'completed';
            // this.orders[index].amount = this.amount?.toString() || '';
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