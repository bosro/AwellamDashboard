import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderType, PaymentService } from '../../../services/payment.service';
import { PaymentReference, Plant } from '../../../services/payment.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Category } from '../../../shared/types/product.interface';
import { Product } from '../../../services/products.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-payment-list',
  templateUrl: './Payment-list.html'
})
export class PaymentListComponent implements OnInit {
  payments: PaymentReference[] = [];
  filteredPayments: PaymentReference[] = [];
  plants: Plant[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  paymentForm: FormGroup;
  editForm: FormGroup;
  filterForm: FormGroup;
  orderTypes = Object.values(OrderType);
  submitting = false;
  editModalVisible = false;
  selectedPayment: PaymentReference | null = null;
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  private readonly apiUrl = `${environment.apiUrl}`;
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
      orderType: ['', Validators.required],
      chequeNumber: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      paymentRef: ['', [Validators.required, Validators.pattern(/^PR\d{11}$/)]],
      plantId: ['', Validators.required],
      orderType: ['', Validators.required],
      chequeNumber: ['', Validators.required]
    });

    this.filterForm = this.fb.group({
      searchPaymentRef: [''],
      searchChequeNumber: [''],
      filterOrderType: [''],
      filterPlantId: ['']
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.loadPlants();
    this.setupFilters();
  }

  setupFilters(): void {
    // Set up filter listeners with type safety
    const searchControls = ['searchPaymentRef', 'searchChequeNumber'] as const;
    const filterControls = ['filterOrderType', 'filterPlantId'] as const;

    // Add debounce to search inputs
    searchControls.forEach(controlName => {
      this.filterForm.get(controlName)?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => this.applyFilters());
    });

    // Immediate filtering for dropdown selections
    filterControls.forEach(controlName => {
      this.filterForm.get(controlName)?.valueChanges
        .subscribe(() => this.applyFilters());
    });
  }

  applyFilters(): void {
    if (!this.payments || !this.payments.length) {
      this.filteredPayments = [];
      this.totalItems = 0;
      return;
    }

    const filters = this.filterForm.value;
    
    // If no filters are applied, show all payments
    if (!filters.searchPaymentRef && !filters.searchChequeNumber && 
        !filters.filterOrderType && !filters.filterPlantId) {
      this.filteredPayments = [...this.payments];
      this.totalItems = this.payments.length;
      return;
    }

    this.filteredPayments = this.payments.filter(payment => {
      // Check each filter condition independently
      const paymentRefMatch = !filters.searchPaymentRef || 
        (payment.paymentRef && 
         payment.paymentRef.toLowerCase().includes(filters.searchPaymentRef.toLowerCase().trim()));

      const chequeNumberMatch = !filters.searchChequeNumber || 
        (payment.chequeNumber && 
         payment.chequeNumber.toString().toLowerCase().includes(
           filters.searchChequeNumber.toString().toLowerCase().trim()
         ));

      const orderTypeMatch = !filters.filterOrderType || 
        (payment.orderType && payment.orderType === filters.filterOrderType);

      const plantIdMatch = !filters.filterPlantId || 
        (payment.plantId && payment.plantId._id === filters.filterPlantId);

      // Return true if ANY of the filter conditions match (OR logic)
      return filters.searchPaymentRef ? paymentRefMatch :
             filters.searchChequeNumber ? chequeNumberMatch :
             filters.filterOrderType ? orderTypeMatch :
             filters.filterPlantId ? plantIdMatch :
             true;
    });

    // Sort filtered results
    this.sortFilteredPayments();

    // Update pagination
    this.totalItems = this.filteredPayments.length;
    this.currentPage = 1;
  }

  private sortFilteredPayments(): void {
    this.filteredPayments.sort((a, b) => {
      return a.paymentRef.localeCompare(b.paymentRef);
    });
  }

  get paginatedPayments(): PaymentReference[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredPayments.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filteredPayments = [...this.payments];
    this.totalItems = this.payments.length;
    this.currentPage = 1;
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
        this.filteredPayments = [...this.payments];
        this.totalItems = this.payments.length;
        this.loading = false;
        this.applyFilters(); // Apply any existing filters to the new data
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
      orderType: payment.orderType,
      chequeNumber: payment.chequeNumber
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