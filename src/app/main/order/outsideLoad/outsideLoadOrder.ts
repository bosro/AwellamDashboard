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
    driver:{
      _id: string;
      name: string
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
    name:string
  };
  amountReceived: number;
  status: string;
  updatedAt: string
}

@Component({
  selector: 'app-orders-table',
  templateUrl: './outsideLoadOrder.html',
//   styleUrls: ['./orders-table.component.css']
})
export class OutSideOrdersTableComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchText: string = '';
  pageSize: number = 5;
  currentPage: number = 1;
  Math=Math

  private apiUrl =`${environment.apiUrl}`
date: string|undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrders();
  }


  toggleOrderStatus(order: Order): void {
    const newStatus = order.status === 'DELIVERED' ? 'DELIVERED' : 'LOADED';
    
    const apiUrl = `${this.apiUrl}/orders/toggle-staus/${order._id}`;

    this.http.put(apiUrl, {}).subscribe(
      () => {
        // Update the order status locally
        order.status = newStatus;
      },
      (error) => {
        console.error('Error updating order status:', error);
      }
    );
  }


  deleteOrder(order: Order) {
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
        const apiUrl = `${this.apiUrl}/orders/outside/delete/${order._id}`;
  
        this.http.delete(apiUrl, {}).subscribe(
          () => {
            // Update the order status locally
            Swal.fire(
              'Deleted!',
              'The order has been deleted.',
              'success'
            );
            this.fetchOrders()
          },
          
          (error) => {
            console.error('Error deleting order status:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the order.',
              'error'
            );
          }
        );
      }
    });
  }


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

  applyFilter(): void {
    this.filteredOrders = this.orders.filter(order =>
      order.customerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      order.truckId.truckNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
      order.productId.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      order.OutsideSoc.toLowerCase().includes(this.searchText.toLowerCase()) ||
      order.plantId.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      order.status.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.currentPage = 1; // Reset to the first page after filtering
  }

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
}