import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Order {
  _id: string;
  customerName: string;
  truckId: {
    _id: string;
    truckNumber: string;
  };
  productId: {
    _id: string;
    name: string;
  };
  capacity: number;
  socNumber: string;
  plantId: {
    _id: string;
    name: string;
  };
  destinationId: {
    _id: string;
  };
  status: string;
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrders();
  }


  toggleOrderStatus(order: Order): void {
    const newStatus = order.status === 'LOADED' ? 'DELIVERED' : 'LOADED';
    const apiUrl = `http://127.0.0.1:3000/api/orders/toggle-staus/${order._id}`;

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


  fetchOrders(): void {
    const apiUrl = 'http://127.0.0.1:3000/api/orders/outside-orders/get';
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
      order.socNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
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