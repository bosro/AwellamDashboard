import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BankTransaction, BankStatementService } from '../../../services/bank-statement.service';
import { CustomersService } from '../../../services/customer.service';
import { OrderTypeService } from '../../../services/order-type.service';
import { ExpenseTypeService } from '../../../services/expenseType.service';
import { Customer } from '../../../shared/types/customer.interface';
import { ExpenseService } from '../../../services/expense.service';

@Component({
  selector: 'app-reconcile-modal',
  templateUrl: './reconcile-model.html',
})
export class ReconcileModalComponent implements OnInit {
  @Input() transaction!: BankTransaction;
  @Output() close = new EventEmitter<void>();
  @Output() transactionReconciled = new EventEmitter<BankTransaction>();
  @Output() expenseCreated = new EventEmitter<void>();

  reconcileForm: FormGroup;
  expenseForm: FormGroup;
  loading = false;
  searchLoading = false;
  orderTypesLoading = true;
  error = '';
  customers: Customer[] = [];
  allCustomers: Customer[] = [];
  orderTypes: any[] = [];
  expenseTypes: any[] = [];
  activeTab: 'customer' | 'payment' = 'customer'; // Main tabs
  activeSubTab: 'suppliers' | 'expenseType' = 'suppliers'; // Sub-tabs under Payment

  constructor(
    private fb: FormBuilder,
    private customerService: CustomersService,
    private bankStatementService: BankStatementService,
    private orderTypeService: OrderTypeService,
    private expenseTypeService: ExpenseTypeService,
    private expenseService:ExpenseService
  ) {
    this.reconcileForm = this.fb.group({
      customerId: ['', Validators.required],
      searchTerm: [''],
    });

    this.expenseForm = this.fb.group({
      subType: ['suppliers', Validators.required], // 'suppliers' or 'expenseType'
      orderTypeId: [''], // For suppliers
      expenseType: ['', Validators.required], // For expense type - added required validator
      amount: [this.transaction?.amount || '', [Validators.required, Validators.min(0.01)]],
      description: [this.transaction?.reference || ''],
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadOrderTypes();
    this.loadExpenseTypes();

    // Initialize form with transaction amount and reference
    this.expenseForm.patchValue({
      amount: this.transaction?.amount || '',
      description: this.transaction?.reference || ''
    });

    // Search functionality for customers
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
      
    // Update validators based on active sub-tab
    this.expenseForm.get('expenseType')?.valueChanges.subscribe(() => {
      this.updateFormValidators();
    });
  }

  updateFormValidators(): void {
    if (this.activeSubTab === 'suppliers') {
      this.expenseForm.get('orderTypeId')?.setValidators([Validators.required]);
      this.expenseForm.get('expenseType')?.clearValidators();
    } else {
      this.expenseForm.get('orderTypeId')?.clearValidators();
      this.expenseForm.get('expenseType')?.setValidators([Validators.required]);
    }
    this.expenseForm.get('orderTypeId')?.updateValueAndValidity();
    this.expenseForm.get('expenseType')?.updateValueAndValidity();
  }

  onSubTabChange(subTab: 'suppliers' | 'expenseType'): void {
    this.activeSubTab = subTab;
    this.updateFormValidators();
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
        this.orderTypes = response.data || [];
        this.orderTypesLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order types.';
        this.orderTypesLoading = false;
      },
    });
  }

  loadExpenseTypes(): void {
    this.expenseTypeService.getAll().subscribe({
      next: (response) => {
        this.expenseTypes = response.expenseTypes || [];
      },
      error: (err) => {
        this.error = 'Failed to load expense types.';
        console.error(err);
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

  onSubmitSupplier(): void {
    if (!this.expenseForm.value.orderTypeId) return;

    const orderTypeId = this.expenseForm.value.orderTypeId;

    this.loading = true;
    this.bankStatementService.reconcileTransactionWithOrderType(this.transaction._id, orderTypeId).subscribe({
      next: (response) => {
        this.loading = false;
        this.transactionReconciled.emit(response.transaction);
        this.onClose();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to reconcile with supplier';
      },
    });
  }

  onSubmitExpense(): void {
    if (this.expenseForm.invalid) return;

    const expense = {
      ...this.expenseForm.value,
      transactionId: this.transaction._id,
    };

    this.loading = true;
    this.expenseService.create(expense).subscribe({
      next: () => {
        this.loading = false;
        this.expenseCreated.emit();
        this.onClose();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to create expense.';
        console.error(err);
      },
    });
  }

  getAmountClass(): string {
    if (!this.transaction) return '';
    return this.transaction.amount < 0 ? 'text-red-600' : 'text-green-600';
  }
}