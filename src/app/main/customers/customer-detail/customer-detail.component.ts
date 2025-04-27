import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomersService } from '../../../services/customer.service';
import { Customer, } from '../../../shared/types/customer.interface';
import { Order } from '../../../services/order.service';
import { OrdersService } from '../../../services/order.service';
// import {OrderResponse} from  '../../../services/order.service'
import printJS from 'print-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

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
  customer!: Customer;
  loading = false;
  tabs: Array<'overview' | 'orders' | 'Payments' | 'notes' | 'SelfLifting'> = ['overview', 'orders', 'Payments', 'notes','SelfLifting'];
  activeTab: 'overview' | 'orders' | 'Payments' | 'notes' | 'SelfLifting' = 'overview' 
  // orders: CustomerOrder[] = [];
  communications: Communication[] = [];
  showNoteForm = false;
  showEmailForm = false;
  showActions = false;
  showAddAddressForm = false;
  showAddPaymentForm = false;
  noteForm: FormGroup;
  emailForm: FormGroup;
  orders!: any[];
  selfliftorder!: any[];
  selectedOrder: any;
  transactions: any[] = [];

    showPriceModal = false;
  priceForm: FormGroup;
  selectedOrderId: string | null = null;
  submitting = false;

  // New properties for merge functionality
  showMergeModal = false;
  mergeLoading = false;
  mergeForm: FormGroup;
  customersList: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm = '';
  mergeResult: any = null;
  mergeError: string = '';

  customerMetrics: CustomerMetrics = {
    lifetimeValue: 0,
    averageOrderValue: 0,
    orderFrequency: 0,
    lastPurchaseDate: null,
    purchaseHistory: []
  };

  goBack() {
    this.router.navigate(['/main/customers/list/'])
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService,
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private http: HttpClient
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

    // Initialize merge form
    this.mergeForm = this.fb.group({
      sourceCustomerId: ['', Validators.required],
      targetCustomerId: ['', Validators.required]
    });

    this.priceForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  isArray(value: any): boolean {
  return Array.isArray(value);
}

hasSocData(order: any): boolean {
  // Check if either socNumbers exists (even if empty array) or socNumber exists
  return (order.socNumbers !== undefined) || 
         (order.socNumber !== undefined && order.socNumber !== null);
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
      this.loadCustomerTransactions(params['id']);
      this.loadSelfLiftOrders(params['id'])
    });
  }

  loadCustomerTransactions(id: string): void {
    if (id) {
      this.customersService.getCustomerTransactions(id).subscribe(response => {
        this.transactions = response.data;
      });
    }
  }

  loadSelfLiftOrders(id: string): void {
    if (id) {
      this.customersService.getSelfLiftOrder(id).subscribe(response => {
        this.selfliftorder = response.data;
      });
    }
  }

  loadOrderDetails(orderId: string | null): void {
    if (orderId) {
      this.ordersService.getOrderById(orderId).subscribe(order => {
        this.selectedOrder = order;
      });
    }
  }

  PrintOrder(orderId: string): void {
    this.loadOrderDetails(orderId);
    setTimeout(() => {
      printJS({
        printable: 'invoice',
        type: 'html',
        style: `
          @page { size: auto; margin: 20mm; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        `,
        documentTitle: 'Invoice'
      });
    }, 1000); // Delay to ensure data is loaded
  }

  // New methods for customer merge functionality
  openMergeModal(): void {
    this.showMergeModal = true;
    this.mergeResult = null;
    this.mergeError = '';
    this.loadCustomersList();

    // Set source customer ID to current customer
    if (this.customer?._id) {
      this.mergeForm.patchValue({
        sourceCustomerId: this.customer._id
      });
    }
  }

  closeMergeModal(): void {
    this.showMergeModal = false;
    this.mergeForm.get('targetCustomerId')?.reset();
    this.searchTerm = '';
  }

  loadCustomersList(): void {
    this.mergeLoading = true;
    this.customersService.getCustomers().subscribe({
      next: (response) => {
        // Filter out the current customer
        this.customersList = response.customers.filter(c => c._id !== this.customer?._id);
        this.filterCustomers();
        this.mergeLoading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.mergeLoading = false;
        this.mergeError = 'Failed to load customers list';
      }
    });
  }



    openPriceModal(orderId: string): void {
      this.selectedOrderId = orderId;
      this.showPriceModal = true;
      
      // Find the order to get its current price
      const order = this.orders.find(o => o._id === orderId);
      if (order && order.orderItems && order.orderItems.length > 0) {
        this.priceForm.get('price')?.setValue(order.orderItems[0].price || 0);
      } else {
        this.priceForm.get('price')?.setValue(0);
      }
    }
    
    closePriceModal(): void {
      this.showPriceModal = false;
      this.selectedOrderId = null;
      this.priceForm.reset();
    }
    
   // Updated submitPriceUpdate method
  submitPriceUpdate(): void {
    if (this.priceForm.invalid || !this.selectedOrderId) {
      return;
    }
    
    this.submitting = true;
    
    // Simplified data structure to match backend expectations
    const data = {
      price: Number(this.priceForm.value.price)
    };
    
    this.ordersService.updateOrderPrice(this.selectedOrderId, data)
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: (response) => {
          console.log('Price update response:', response);
          
          // Update the order in the filtered orders list with the fully updated order from response
          // const index = this.filteredOrders.findIndex(o => o._id === this.selectedOrderId);
          // if (index !== -1 && response.updatedOrder) {
          //   this.filteredOrders[index] = response.updatedOrder;
          // }
          
          // // Also update in the allOrders array
          // const allOrdersIndex = this.allOrders.findIndex(o => o._id === this.selectedOrderId);
          // if (allOrdersIndex !== -1 && response.updatedOrder) {
          //   this.allOrders[allOrdersIndex] = response.updatedOrder;
          // }
          
          Swal.fire({
            title: 'Success',
            html: `
              Order price has been updated successfully<br>
  
            `,
            icon: 'success'
          });
          
          this.closePriceModal();
        },
        error: (error) => {
          console.error('Error updating order price:', error);
          Swal.fire('Error', 'Failed to update order price: ' + (error.error?.details || error.message || 'Unknown error'), 'error');
        }
      });
  }

  
  filterCustomers(): void {
    if (!this.searchTerm) {
      this.filteredCustomers = this.customersList;
      return;
    }
    
    const search = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.customersList.filter(customer => 
      customer.fullName.toLowerCase().includes(search) || 
      (customer.phoneNumber && customer.phoneNumber.toString().includes(search)) ||
      (customer.email && customer.email.toLowerCase().includes(search))
    );
  }

  mergeCustomers(): void {
    if (this.mergeForm.invalid) {
      return;
    }

    if (this.mergeForm.value.sourceCustomerId === this.mergeForm.value.targetCustomerId) {
      this.mergeError = 'Source and target customers cannot be the same';
      return;
    }

    this.mergeLoading = true;
    // Use the API endpoint for merging customers
    this.http.post<any>(`${environment.apiUrl}/customers/merge`, this.mergeForm.value)
      .subscribe({
        next: (result) => {
          this.mergeResult = result;
          this.mergeLoading = false;
          
          // Reload current customer data if it's the target customer
          if (this.customer?._id === this.mergeForm.value.targetCustomerId) {
            this.loadCustomer(this.customer._id);
            this.loadCustomerTransactions(this.customer._id);
          } else {
            // If current customer was merged into another, redirect to the target customer
            this.router.navigate(['/main/customers/details', this.mergeForm.value.targetCustomerId]);
          }
        },
        error: (error) => {
          console.error('Error merging customers:', error);
          this.mergeError = error.error?.message || 'Failed to merge customers';
          this.mergeLoading = false;
        }
      });
  }

  // Print merge details method
  printMergeDetails(): void {
    if (!this.mergeResult) return;
    
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; margin-bottom: 20px;">Customer Merge Details</h1>
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
          <h2 style="margin-top: 0;">Success! ${this.mergeResult.message}</h2>
          <p><strong>Merge Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1; border: 1px solid #ddd; border-radius: 5px; padding: 15px;">
            <h2>Source Customer (Merged From)</h2>
            <p><strong>ID:</strong> ${this.mergeResult.details.sourceCustomer.id}</p>
            <p><strong>Name:</strong> ${this.mergeResult.details.sourceCustomer.name}</p>
            <p><strong>Status:</strong> ${this.mergeResult.details.sourceCustomer.status}</p>
          </div>
          
          <div style="flex: 1; border: 1px solid #ddd; border-radius: 5px; padding: 15px;">
            <h2>Target Customer (Merged Into)</h2>
            <p><strong>ID:</strong> ${this.mergeResult.details.targetCustomer.id}</p>
            <p><strong>Name:</strong> ${this.mergeResult.details.targetCustomer.name}</p>
            <p><strong>New Balance:</strong> ${this.mergeResult.details.targetCustomer.newBalance}</p>
            <p><strong>Total Orders:</strong> ${this.mergeResult.details.targetCustomer.totalOrders}</p>
          </div>
        </div>
        
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-top: 20px;">
          <h2>Transfer Summary</h2>
          <p><strong>Orders Transferred:</strong> ${this.mergeResult.details.ordersTransferred}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>This is an automated report generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Customer Merge Details</title>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  private loadCustomer(id: string): void {
    this.loading = true;
    this.customersService.getCustomerById(id).subscribe({
      next: (response) => {
        this.customer = response.customer; // Access the customer property from the response
        this.loadCustomerData();
        this.loading = false;
        
        // Set the source customer ID in the merge form
        if (this.customer?._id) {
          this.mergeForm.patchValue({
            sourceCustomerId: this.customer._id
          });
        }
        
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