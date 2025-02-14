import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

export interface Order {
  _id: string;
  customerName: string;
  truckId: {
    _id: string;
    truckNumber: string;
    driver: {
      _id: string;
      name: string;
    };
  };
  productId: {
    _id: string;
    name: string;
  };
  loadedbags: number;
  OutsideSoc: string;
  plantId: {
    _id: string;
    name: string;
  };
  destinationId: {
    _id: string;
    name: string;
  };
  amountReceived: number;
  status: string;
  updatedAt: string;
}

@Component({
  selector: 'app-orders-table',
  templateUrl: './outsideLoadOrder.html',
})
export class OutSideOrdersTableComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchText: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  Math = Math;

  // Edit Modal Variables
  isEditModalOpen: boolean = false;
  editedOrder!: Order ;

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  // Fetch Orders
  fetchOrders(): void {
    const apiUrl = `${this.apiUrl}/orders/outside-orders/get`;
    this.http.get<{ orders: Order[] }>(apiUrl).subscribe(
      (response) => {
        this.orders = response.orders;
        this.filteredOrders = response.orders;
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  // Apply Filter
  applyFilter(): void {
    this.filteredOrders = this.orders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.truckId.truckNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.productId.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.OutsideSoc.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.plantId.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.status.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.currentPage = 1; // Reset to the first page after filtering
  }

  // Pagination Logic
  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  // Open Edit Modal
  openEditModal(order: Order): void {
    this.editedOrder = { ...order }; // Create a copy of the order to edit
    this.isEditModalOpen = true;
  }

  // Close Edit Modal
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editedOrder ;
  }

  // Save Edited Order
  saveEditedOrder(): void {
    if (this.editedOrder) {
      const apiUrl = `${this.apiUrl}/orders/outside/update/${this.editedOrder._id}`;
      this.http.put(apiUrl, this.editedOrder).subscribe(
        () => {
          // Update the order in the local list
          const index = this.orders.findIndex((o) => o._id === this.editedOrder!._id);
          if (index !== -1) {
            this.orders[index] = { ...this.editedOrder! };
            this.filteredOrders = [...this.orders]; // Refresh filtered list
          }
          this.closeEditModal();
          Swal.fire('Success!', 'Order updated successfully.', 'success');
        },
        (error) => {
          console.error('Error updating order:', error);
          Swal.fire('Error!', 'Failed to update order.', 'error');
        }
      );
    }
  }

  // Toggle Order Status
  toggleOrderStatus(order: Order): void {
    const newStatus = order.status === 'DELIVERED' ? 'DELIVERED' : 'LOADED';
    const apiUrl = `${this.apiUrl}/orders/toggle-status/${order._id}`;
  
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to change the status to DELIVERED ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.put(apiUrl, {}).subscribe(
          () => {
            order.status = newStatus;
            Swal.fire(
              'Updated!',
              `The order status has been changed to DELIVERED .`,
              'success'
            );
            this.fetchOrders();
          },
          (error) => {
            console.error('Error updating order status:', error);
            Swal.fire(
              'Error!',
              'There was an error updating the order status.',
              'error'
            );
          }
        );
      }
    });
  }

  // Delete Order
  deleteOrder(order: Order): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const apiUrl = `${this.apiUrl}/orders/outside/delete/${order._id}`;
        this.http.delete(apiUrl, {}).subscribe(
          () => {
            this.fetchOrders();
            Swal.fire('Deleted!', 'The order has been deleted.', 'success');
          },
          (error) => {
            console.error('Error deleting order:', error);
            Swal.fire('Error!', 'Failed to delete the order.', 'error');
          }
        );
      }
    });
  }
}