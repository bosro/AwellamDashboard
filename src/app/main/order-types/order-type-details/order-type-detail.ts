import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderTypeService } from '../../../services/order-type.service';

@Component({
  selector: 'app-order-type-details',
  templateUrl: './order-type-detail.html',
})
export class OrderTypeDetails implements OnInit {
  orderTypeId!: string;
  paymentReferences: any[] = [];
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private orderTypeService: OrderTypeService) {}

  ngOnInit(): void {
    // Get the orderTypeId from the route parameters
    this.orderTypeId = this.route.snapshot.paramMap.get('id') || '';

    if (this.orderTypeId) {
      this.fetchPaymentReferences();
    } else {
      this.error = 'Invalid order type ID.';
      this.loading = false;
    }
  }

  fetchPaymentReferences(): void {
    this.orderTypeService.getPaymentReferences(this.orderTypeId).subscribe({
      next: (response) => {
        this.paymentReferences = response.paymentReferences || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch payment references.';
        console.error(err);
        this.loading = false;
      },
    });
  }
}