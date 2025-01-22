// components/order-details/order-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdersService } from '../../../services/order.service';
import { Order, OrderStatus, PaymentStatus } from '../../../shared/types/order.interface';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent implements OnInit {
  order?: Order;
  loading = false;
  saving = false;
  showNoteForm = false;
  showRefundForm = false;
  showShippingForm = false;
  noteForm: FormGroup;
  refundForm: FormGroup;
  shippingForm: FormGroup;
  orderTimeline: any[] = [];
  OrderStatus = OrderStatus
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private fb: FormBuilder
  ) {
    this.noteForm = this.fb.group({
      content: ['', Validators.required],
      type: ['internal']
    });

    this.refundForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required],
      items: this.fb.array([]),
      refundShipping: [false]
    });

    this.shippingForm = this.fb.group({
      carrier: ['', Validators.required],
      trackingNumber: ['', Validators.required],
      estimatedDelivery: [''],
      notifyCustomer: [true]
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
      next: (order) => {
        this.order = order;
        this.buildTimeline();
        this.initializeRefundForm();
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
        date: this.order.metadata.createdAt,
        title: 'Order Placed',
        description: `Order #${this.order.orderNumber} was placed`,
        icon: 'ri-shopping-cart-line',
        status: 'completed'
      },
      {
        date: this.order.billing.paymentStatus === 'paid' ? this.order.metadata.createdAt : null,
        title: 'Payment Confirmed',
        description: `Payment of $${this.order.pricing.total} was received`,
        icon: 'ri-bank-card-line',
        status: this.order.billing.paymentStatus === 'paid' ? 'completed' : 'pending'
      },
      {
        date: this.order.status === 'processing' ? this.order.metadata.updatedAt : null,
        title: 'Processing',
        description: 'Order is being prepared',
        icon: 'ri-loader-4-line',
        status: this.getTimelineStatus('processing')
      },
      {
        date: this.order.status === 'shipped' ? this.order.metadata.updatedAt : null,
        title: 'Shipped',
        description: this.order.shipping.trackingNumber ? 
          `Shipped via ${this.order.shipping.carrier} (${this.order.shipping.trackingNumber})` : 
          'Order shipped',
        icon: 'ri-truck-line',
        status: this.getTimelineStatus('shipped')
      },
      {
        date: this.order.status === 'delivered' ? this.order.metadata.updatedAt : null,
        title: 'Delivered',
        description: 'Order has been delivered',
        icon: 'ri-checkbox-circle-line',
        status: this.getTimelineStatus('delivered')
      }
    ];
  }

  private getTimelineStatus(status: string): 'completed' | 'current' | 'pending' {
    if (!this.order) return 'pending';
    
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.order.status);
    const statusIndex = statusOrder.indexOf(status);

    if (currentIndex > statusIndex) return 'completed';
    if (currentIndex === statusIndex) return 'current';
    return 'pending';
  }

  private initializeRefundForm(): void {
    if (!this.order) return;

    const itemsArray = this.refundForm.get('items') as FormArray;
    itemsArray.clear();

    this.order.items.forEach(item => {
      itemsArray.push(this.fb.group({
        productId: [item.productId],
        quantity: [0, [Validators.required, Validators.min(0), Validators.max(item.quantity)]],
        amount: [0],
        selected: [false]
      }));
    });
  }

  updateOrderStatus(status: OrderStatus): void {
    if (!this.order) return;

    this.saving = true;
    this.ordersService.updateOrderStatus(this.order.id, status).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.buildTimeline();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.saving = false;
      }
    });
  }

  addNote(): void {
    if (!this.order || !this.noteForm.valid) return;

    this.saving = true;
    this.ordersService.addOrderNote(this.order.id, this.noteForm.value).subscribe({
      next: (note) => {
        this.order?.notes.push(note);
        this.showNoteForm = false;
        this.noteForm.reset();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error adding note:', error);
        this.saving = false;
      }
    });
  }

  processRefund(): void {
    if (!this.order || !this.refundForm.valid) return;

    this.saving = true;
    this.ordersService.processRefund(this.order.id, this.refundForm.value).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.showRefundForm = false;
        this.refundForm.reset();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error processing refund:', error);
        this.saving = false;
      }
    });
  }

  updateShipping(): void {
    if (!this.order || !this.shippingForm.valid) return;

    this.saving = true;
    this.ordersService.updateShippingInfo(this.order.id, this.shippingForm.value).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.showShippingForm = false;
        this.shippingForm.reset();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating shipping:', error);
        this.saving = false;
      }
    });
  }

  resendConfirmation(): void {
    // Implement resend confirmation email
  }

  downloadInvoice(): void {
    // Implement invoice download
  }

  validateAddress(address: any): void {
    this.ordersService.validateAddress(address).subscribe({
      next: (response) => {
        // Handle address validation response
      },
      error: (error) => console.error('Error validating address:', error)
    });
  }

  getShippingRates(): void {
    if (!this.order) return;

    this.ordersService.getShippingRates({
      items: this.order.items,
      address: this.order.shipping.address
    }).subscribe({
      next: (rates) => {
        // Handle shipping rates response
      },
      error: (error) => console.error('Error getting shipping rates:', error)
    });
  }

  getTrackingUrl(): string {
    if (!this.order?.shipping.trackingNumber || !this.order?.shipping.carrier) {
      return '';
    }
  
    const carrierUrls = {
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${this.order.shipping.trackingNumber}`,
      'ups': `https://www.ups.com/track?tracknum=${this.order.shipping.trackingNumber}`,
      'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${this.order.shipping.trackingNumber}`,
      'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${this.order.shipping.trackingNumber}`
    };
  
    return carrierUrls[this.order.shipping.carrier as keyof typeof carrierUrls] || '';
  }
  
  canProcessRefund(): boolean {
    if (!this.order) return false;
    
    // Can process refund if order is delivered and payment status is 'paid'
    return (
      this.order.status === 'delivered' && 
      this.order.billing.paymentStatus === 'paid' &&
      !this.order.billing.paymentStatus.includes('refunded')
    );
  }
}