export enum OrderType {
  GUARANTEE_ORDER = "GUARANTEE ORDER ",
  SPECIAL_GUARANTEE_ORDER= "SPECIAL GUARANTEE ORDER",
NORMAL_CHÈQUE_ORDER= "NORMAL CHÈQUE ORDER",
CASH_ORDER = "CASH ORDER",
BORROWED_ORDER= "BORROWED_ORDER"
}

// src/app/components/payment-list/payment-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../../services/payment.service';
import { PaymentReference, Plant } from '../../../services/payment.service';
// import { OrderType } from '../../../models/enums';
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
  orderTypes = Object.values(OrderType);
  submitting = false;


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
  }



  ngOnInit(): void {
    this.loadPayments();
    this.loadPlants();
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

  loadCategories(plantId: string): void {
    this.loading = true;
    this.http.get<{ categories: Category[] }>(`${this.apiUrl}/category/plants/${plantId}`).subscribe({
      next: (response) => {
        this.categories = response.categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  loadProducts(categoryId: string): void {
    this.loading = true;
    this.http.get<{ products: Product[] }>(`${this.apiUrl}/products/category/${categoryId}`).subscribe({
      next: (response) => {
        this.products = response.products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.loading = false;
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