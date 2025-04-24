import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BankTransaction, BankStatementService } from '../../../services/bank-statement.service';
import { CustomersService } from '../../../services/customer.service';
import { Customer } from '../../../shared/types/customer.interface';

@Component({
  selector: 'app-reconcile-modal',
  templateUrl: './reconcile-model.html',
})
export class ReconcileModalComponent implements OnInit {
  @Input() transaction!: BankTransaction;
  @Output() close = new EventEmitter<void>();
  @Output() transactionReconciled = new EventEmitter<BankTransaction>();

  reconcileForm: FormGroup;
  loading = false;
  searchLoading = false;
  error = '';
  customers: Customer[] = [];
  allCustomers: Customer[] = []; // Store all customers for local filtering

  constructor(
    private fb: FormBuilder,
    private customerService: CustomersService,
    private bankStatementService: BankStatementService
  ) {
    this.reconcileForm = this.fb.group({
      customerId: ['', [Validators.required]],
      searchTerm: [''],
    });
  }

  ngOnInit(): void {
    this.loadCustomers();

    // Setup local search with debounce
    this.reconcileForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged() // Only emit if the value changes
      )
      .subscribe((term: string) => {
        if (!term.trim()) {
          // If the search term is empty, reset to all customers
          this.customers = [...this.allCustomers];
        } else {
          // Filter customers locally based on the search term
          this.customers = this.allCustomers.filter((customer: Customer) =>
            customer.fullName.toLowerCase().includes(term.toLowerCase())
          );
        }
      });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.allCustomers = response.customers; // Store all customers for filtering
        this.customers = [...this.allCustomers]; // Initialize the displayed customers
      },
      error: (err) => {
        this.error = 'Failed to load customers: ' + err.message;
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.reconcileForm.invalid) {
      return;
    }

    const customerId = this.reconcileForm.value.customerId;

    this.loading = true;
    this.bankStatementService.reconcileTransaction(this.transaction._id, customerId).subscribe({
      next: (response) => {
        this.loading = false;
        this.transactionReconciled.emit(response.transaction);
        this.onClose(); // Close the modal after successful reconciliation
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to reconcile transaction';
      },
    });
  }
}