export enum OrderType {
  GUARANTEE_ORDER = "GUARANTEE ORDER",
  SPECIAL_GUARANTEE_ORDER = "SPECIAL GUARANTEE ORDER",
  NORMAL_CHEQUE_ORDER = "NORMAL CHÈQUE ORDER",
  CASH_ORDER = "CASH ORDER"
}

// src/app/components/payment-list/payment-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../../services/payment.service';
import { PaymentReference, Plant } from '../../../services/payment.service';
// import { OrderType } from '../../../models/enums';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-list',
  templateUrl: './Payment-list.html'
})
export class PaymentListComponent implements OnInit {
  payments: PaymentReference[] = [];
  plants: Plant[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  paymentForm: FormGroup;
  orderTypes = Object.values(OrderType);
  submitting = false;

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      paymentRef: ['', [Validators.required, Validators.minLength(5)]],
      plantId: ['', Validators.required],
      orderType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.loadPlants();
  }

  loadPlants(): void {
    this.paymentService.getPlants().subscribe({
      next: (response) => {
        this.plants = response.plants;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.error = 'Failed to load plants';
      }
    });
  }

  openDetails(id: string): void {
    this.router.navigate([`main/transport/payment-ref/${id}`]);
  }

  loadPayments(): void {
    this.loading = true;
    this.error = null;
    
    this.paymentService.getPaymentReferences().subscribe({
      next: (response) => {
        this.payments = response.paymentReferences;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load payment references';
        this.loading = false;
        console.error('Error loading payments:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.submitting = true;
      this.error = null;

      this.paymentService.createPaymentReference(this.paymentForm.value).subscribe({
        next: () => {
          this.loadPayments();
          this.showForm = false;
          this.paymentForm.reset();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating payment reference:', error);
          this.error = 'Failed to create payment reference';
          this.submitting = false;
        }
      });
    }
  }
}