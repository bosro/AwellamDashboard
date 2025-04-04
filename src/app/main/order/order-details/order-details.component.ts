// order-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdersService } from '../../../services/order.service';

interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
  _id: string;
}


interface Order {
  _id: string;
  status: string;
  customerId: {
    _id: string;
    fullName: string;
    phoneNumber: number;
  };
  deliveryAddress: string;
  orderItems: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  assignedTruck?: {
_id: string,
name: string,
driver:{
  _id:string,
  name: string,
  phoneNumber: string
}
  }
  assignedDriver?: {
    _id: string,
    name: string
  }
  socNumber:{
    _id: string,
    socNumber: string
  }
 
  categoryId?: {
    _id:string,
    name: string,
    plantId:{
      _id: string,
      name:string
    }
  
  }
}

interface OrderResponse {
  message: string;
  order: {
    _id: string;
    status: string;
    customerId: {
      _id: string;
      fullName: string;
      phoneNumber: number;
    };
    deliveryAddress: string;
    orderItems: {
      product: {
        _id: string;
        name: string;
      };
      quantity: number;
      price: number;
      _id: string;
    }[];
    totalAmount: number;
    paymentStatus: string;
    deliveryStatus: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    orderNumber: string;
    assignedDriver?: {
      _id: string,
      name: string
    },
    categoryId?: {
      _id: string,
      name: string,
      plantId: {
        _id: string,
        name: string
      }
    }
  };
}



@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent implements OnInit {
  order?: any;
  loading = false;
  saving = false;
  showNoteForm = false;
  noteForm: FormGroup;
  orderTimeline: any[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private fb: FormBuilder
  ) {
    this.noteForm = this.fb.group({
      content: ['', Validators.required],
      type: ['internal']
    });
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  private loadOrder(id: string): void {
    this.loading = true;
    this.ordersService.getOrderById(id).subscribe({
      next: (response) => {
        this.order = {
          ...response.order,
          categoryId: response.order.categoryId || { _id: '', name: '', plantId: { _id: '', name: '' } },
          socNumber: response.order.socNumbers|| { _id: '', socNumber: '' }
        };
        this.buildTimeline();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading = false;
      }
    });
  }

  private buildTimeline(): void {
    if (!this.order) return;

    this.orderTimeline = [
      {
        date: this.order.createdAt,
        title: 'Order Placed',
        description: `Order ${this.order.orderNumber} was placed`,
        icon: 'ri-shopping-cart-line',
        status: 'completed'
      },
      {
        date: this.order.paymentStatus === 'Paid' ? this.order.createdAt : null,
        title: 'Order Confirmed',
        description: 'Customer has confirmed order',
        icon: 'ri-bank-card-line',
        status: this.order.paymentStatus === 'Paid' ? 'completed' : 'pending'
      },
      {
        date: this.order.status === 'PROCESSING' ? this.order.updatedAt : null,
        title: 'Assingned',
        description: 'Driver has been Assigned',
        icon: 'ri-loader-4-line',
        status: this.getTimelineStatus('PROCESSING')
      },
      {
        date: this.order.deliveryStatus === 'SHIPPING' ? this.order.updatedAt : null,
        title: 'Transported',
        description: 'Order is on the way',
        icon: 'ri-truck-line',
        status: this.getTimelineStatus('SHIPPING')
      },
      {
        date: this.order.status === 'DELIVERED' ? this.order.updatedAt : null,
        title: 'Delivered',
        description: 'Order has been delivered',
        icon: 'ri-checkbox-circle-line',
        status: this.getTimelineStatus('DELIVERED')
      }
    ];
  }

  private getTimelineStatus(status: string): 'completed' | 'current' | 'pending' {
    if (!this.order) return 'pending';
    
    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(this.order.status);
    const statusIndex = statusOrder.indexOf(status);

    if (currentIndex > statusIndex) return 'completed';
    if (currentIndex === statusIndex) return 'current';
    return 'pending';
  }
}