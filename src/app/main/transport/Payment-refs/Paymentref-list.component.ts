import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderType, PaymentService } from '../../../services/payment.service';
import { PaymentReference, Plant } from '../../../services/payment.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Category } from '../../../shared/types/product.interface';
import { Product } from '../../../services/products.service';

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
  editForm: FormGroup;
  orderTypes = Object.values(OrderType);
  submitting = false;
  editModalVisible = false;
  selectedPayment: PaymentReference | null = null;

  private readonly apiUrl = `${environment.apiUrl}`
  categories!: Category[];
  products!: Product[];

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.paymentForm = this.fb.group({
      paymentRef: ['', [Validators.required, Validators.pattern(/^PR\d{11}$/)]],
      plantId: ['', Validators.required],
      orderType: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      paymentRef: ['', [Validators.required, Validators.pattern(/^PR\d{11}$/)]],
      plantId: ['', Validators.required],
      orderType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.loadPlants();
  }


  openDetails(id: string): void {
    this.router.navigate([`main/transport/payment-ref/${id}`]);
  }

  
  loadPlants(): void {
    this.loading = true;
    this.http.get<{ plants: Plant[] }>(`${this.apiUrl}/plants/get`).subscribe({
      next: (response) => {
        this.plants = response.plants;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.error = 'Failed to load plants';
        this.loading = false;
      }
    });
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

  openEditModal(payment: PaymentReference): void {
    this.selectedPayment = payment;
    this.editForm.patchValue({
      paymentRef: payment.paymentRef,
      plantId: payment.plantId._id,
      orderType: payment.orderType
    });
    this.editModalVisible = true;
  }

  closeEditModal(): void {
    this.editModalVisible = false;
    this.selectedPayment = null;
    this.editForm.reset();
  }

  onEditSubmit(): void {
    if (this.editForm.valid && this.selectedPayment) {
      this.submitting = true;
      this.error = null;

      const updatedPayment = { ...this.selectedPayment, ...this.editForm.value };

      this.paymentService.updatePaymentReference(updatedPayment).subscribe({
        next: () => {
          this.loadPayments();
          this.closeEditModal();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error updating payment reference:', error);
          this.error = 'Failed to update payment reference';
          this.submitting = false;
        }
      });
    }
  }

  deletePayment(paymentId: string): void {
    if (confirm('Are you sure you want to delete this payment reference?')) {
      this.paymentService.deletePaymentReference(paymentId).subscribe({
        next: () => {
          this.loadPayments();
        },
        error: (error) => {
          console.error('Error deleting payment reference:', error);
          this.error = 'Failed to delete payment reference';
        }
      });
    }
  }
}