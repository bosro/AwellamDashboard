// components/reconcile-modal/reconcile-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BankTransaction, BankStatementService } from '../../../services/bank-statement.service';
import { CustomersService } from '../../../services/customer.service';
import { Customer } from '../../../shared/types/customer.interface';

@Component({
  selector: 'app-reconcile-modal',
  templateUrl: './reconcile-model.html',
//   styleUrls: ['./reconcile-modal.component.scss']
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

  constructor(
    private fb: FormBuilder,
    private customerService: CustomersService,
    private bankStatementService: BankStatementService
  ) {
    this.reconcileForm = this.fb.group({
      customerId: ['', [Validators.required]],
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    
    // Setup search with debounce
    this.reconcileForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        // switchMap(term => {
        //   this.searchLoading = true;
        // //   return this.customerService.searchCustomers(term);
        // })
      )
      .subscribe({
        next: (customers) => {
          this.customers = customers;
          this.searchLoading = false;
        },
        error: (err) => {
          this.error = 'Error searching customers: ' + err.message;
          this.searchLoading = false;
        }
      });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.customers;
      },
      error: (err) => {
        this.error = 'Failed to load customers: ' + err.message;
      }
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
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to reconcile transaction';
      }
    });
  }
}