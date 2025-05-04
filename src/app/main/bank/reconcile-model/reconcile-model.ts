import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BankTransaction, BankStatementService } from '../../../services/bank-statement.service';
import { CustomersService } from '../../../services/customer.service';
import { OrderTypeService } from '../../../services/order-type.service';
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
  orderTypesLoading = true;
  error = '';
  customers: Customer[] = [];
  allCustomers: Customer[] = [];
  orderTypes: any[] = [];
  selectedOrderType: string = '';
  activeTab: 'customers' | 'orderType' = 'customers';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomersService,
    private bankStatementService: BankStatementService,
    private orderTypeService: OrderTypeService
  ) {
    this.reconcileForm = this.fb.group({
      customerId: ['', Validators.required],
      searchTerm: [''],
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadOrderTypes();

    this.reconcileForm.get('searchTerm')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term: string) => {
        if (!term.trim()) {
          this.customers = [...this.allCustomers];
        } else {
          this.customers = this.allCustomers.filter((customer: Customer) =>
            customer.fullName.toLowerCase().includes(term.toLowerCase())
          );
        }
      });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.allCustomers = response.customers;
        this.customers = [...this.allCustomers];
      },
      error: (err) => {
        this.error = 'Failed to load customers: ' + err.message;
      },
    });
  }

  loadOrderTypes(): void {
    this.orderTypeService.getAllOrderTypes().subscribe({
      next: (response) => {
        this.orderTypes = response.data;
        this.orderTypesLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order types.';
        this.orderTypesLoading = false;
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmitCustomer(): void {
    if (this.reconcileForm.invalid) return;

    const customerId = this.reconcileForm.value.customerId;

    this.loading = true;
    this.bankStatementService.reconcileTransaction(this.transaction._id, customerId).subscribe({
      next: (response) => {
        this.loading = false;
        this.transactionReconciled.emit(response.transaction);
        this.onClose();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to reconcile transaction';
      },
    });
  }

  onSubmitOrderType(): void {
    if (!this.selectedOrderType) return;

    this.loading = true;
    this.bankStatementService
      .reconcileTransactionWithOrderType(this.transaction._id, this.selectedOrderType)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.transactionReconciled.emit(response.transaction);
          this.onClose();
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error || 'Failed to reconcile with order type';
        },
      });
  }
}
