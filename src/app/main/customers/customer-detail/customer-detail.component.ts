import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomersService } from '../../../services/customer.service';
import { Customer, } from '../../../shared/types/customer.interface';
import { Order } from '../../../services/order.service';
// import {OrderResponse} from  '../../../services/order.service'

interface CustomerOrder {
  id: string;
  orderNumber: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  status: OrderStatus;
  discount?: number;
}

export interface OrderResponse {
  message: string;
  orders: Order[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface CustomerMetrics {
  lifetimeValue: number;
  averageOrderValue: number;
  orderFrequency: number;
  lastPurchaseDate: Date | null;
  purchaseHistory: PurchaseHistoryItem[];
}

interface PurchaseHistoryItem {
  month: string;
  amount: number;
  orders: number;
}

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'phone' | 'marketing';
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'pending' | 'failed';
  date: string;
}





@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-detail.component.html'
})
export class CustomerDetailsComponent implements OnInit {
  customer?: Customer;
  loading = false;
  tabs: Array<'overview' | 'orders' | 'communications' | 'notes'> = ['overview', 'orders', 'communications', 'notes'];
  activeTab: 'overview' | 'orders' | 'communications' | 'notes' = 'overview';
  // orders: CustomerOrder[] = [];
  communications: Communication[] = [];
  showNoteForm = false;
  showEmailForm = false;
  showActions = false;
  showAddAddressForm = false;
  showAddPaymentForm = false;
  noteForm: FormGroup;
  emailForm: FormGroup;
  orders: Order[] = [];
  

  
  customerMetrics: CustomerMetrics = {
    lifetimeValue: 0,
    averageOrderValue: 0,
    orderFrequency: 0,
    lastPurchaseDate: null,
    purchaseHistory: []
  };
  
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService,
    private fb: FormBuilder
  ) {
    this.noteForm = this.fb.group({
      content: ['', Validators.required],
      type: ['internal']
    });

    this.emailForm = this.fb.group({
      subject: ['', Validators.required],
      content: ['', Validators.required],
      template: [''],
      attachments: [[]]
    });
  }

  // Add missing methods for component functionality
  editAddress(address: any): void {
    // Implementation for editing address
    console.log('Editing address:', address);
  }

  deleteAddress(addressId: string): void {
    // Implementation for deleting address
    console.log('Deleting address:', addressId);
  }

  getPaymentIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'visa': return 'ri-visa-line';
      case 'mastercard': return 'ri-mastercard-line';
      case 'amex': return 'ri-bank-card-line';
      default: return 'ri-bank-card-line';
    }
  }

  setDefaultPayment(paymentId: string): void {
    // Implementation for setting default payment
    console.log('Setting default payment:', paymentId);
  }

  deletePayment(paymentId: string): void {
    // Implementation for deleting payment
    console.log('Deleting payment:', paymentId);
  }

  getStatusClass(status?: string): string {
    if (!status) return '';
    
    const statusClasses: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return statusClasses[status.toLowerCase()] || '';
  }








  viewDetails(communicationId: string): void {
    // Implementation for viewing communication details
    console.log('Viewing details:', communicationId);
  }

  cancelOrder(orderId: string): void {
    // Implementation for canceling order
    console.log('Canceling order:', orderId);
  }

  // Existing methods remain the same...
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadCustomer(params['id']);
      }
    });
  }

  private loadCustomer(id: string): void {
    this.loading = true;
    this.customersService.getCustomerById(id).subscribe({
      next: (response) => {
        this.customer = response.customer; // Access the customer property from the response
        this.loadCustomerData();
        this.loading = false;
        console.log(this.customer);
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.loading = false;
      }
    });
  }






  
 

  private loadCustomerData(): void {
    if (!this.customer) return;

    // Load orders
    this.customersService.getCustomerOrders(this.customer._id).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.calculateMetrics();
        // console.log(this.orders)
      }
    });

    // Load communications
    // this.customersService.getCommunicationHistory(this.customer._id).subscribe({
    //   next: (communications) => {
    //     this.communications = communications;
    //   }
    // });
  }

  private calculateMetrics(): void {
    if (!this.orders.length) {
      this.customerMetrics = {
        lifetimeValue: 0,
        averageOrderValue: 0,
        orderFrequency: 0,
        lastPurchaseDate: null,
        purchaseHistory: []
      };
      return;
    }

    const orderDates = this.orders.map(o => new Date(o.createdAt));
    const lastPurchaseDate = new Date(Math.max(...orderDates.map(date => date.getTime())));

    // this.customerMetrics = {
    //   lifetimeValue: this.orders.reduce((sum, order) => sum + order.total, 0),
    //   averageOrderValue: this.orders.reduce((sum, order) => sum + order.total, 0) / this.orders.length,
    //   orderFrequency: this.calculateOrderFrequency(this.orders),
    //   lastPurchaseDate,
    //   purchaseHistory: this.aggregatePurchaseHistory(this.orders)
    // };
  }

  private calculateOrderFrequency(orders: CustomerOrder[]): number {
    if (orders.length < 2) return 0;
    
    const dates = orders.map(o => new Date(o.createdAt)).sort((a, b) => a.getTime() - b.getTime());
    const totalDays = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
    return totalDays / (orders.length - 1);
  }

  private aggregatePurchaseHistory(orders: CustomerOrder[]): PurchaseHistoryItem[] {
    return orders.reduce<PurchaseHistoryItem[]>((acc, order) => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const existingMonth = acc.find(m => m.month === month);
      
      if (existingMonth) {
        existingMonth.amount += order.total;
        existingMonth.orders += 1;
      } else {
        acc.push({ month, amount: order.total, orders: 1 });
      }
      
      return acc;
    }, []);
  }





}