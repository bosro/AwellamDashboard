import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomersService } from '../../../services/customer.service';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction, TransactionType, PaymentMethod, BankName } from '../../../../types';
import { Customer } from '../../../shared/types/customer.interface';
import { debounceTime, distinctUntilChanged, Subject, Subscription, catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionComponent implements OnInit, OnDestroy {
  // Data collections
  customers: Customer[] = [];
  transactions: any[] = [];
  filteredCustomers: Customer[] = [];
  
  // Store all transactions for client-side filtering
  allTransactions: any[] = [];
  filteredTransactions: any[] = [];
  
  // Filter variables
  selectedCustomerId: string = '';
  selectedType: string = '';
  selectedPaymentMethod: string = '';
  selectedBankName: string = '';
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';
  Math = Math;
  
  // Search debounce
  private searchTerms = new Subject<string>();
  private customerSearchTerms = new Subject<string>();
  customerSearchTerm: string = '';
  
  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];
  
  // Form data
  transactionForm: Partial<Transaction> = {
    type: TransactionType.PAYMENT,
    amount: 0,
    paymentMethod: PaymentMethod.CASH,
    bankName: '',
    Reference: '',
    date: new Date() // Set default date to today
  };
  
  // Modal states
  showModal: boolean = false;
  showDetailsModal: boolean = false;
  isEditMode: boolean = false;
  selectedTransaction: any | null = null;
  
  // Dropdown options
  transactionTypes = Object.values(TransactionType);
  paymentMethods = Object.values(PaymentMethod);
  bankNames = Object.values(BankName);
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  
  // Statistics
  totalTransactions: number = 0;
  totalAmount: number = 0;
  averageTransaction: number = 0;
  
  // Loading state
  loading: boolean = false;

  constructor(
    private customerService: CustomersService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.setupObservables();
    this.loadAllTransactions(); // Load all transactions once
  }
  
  ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setupObservables(): void {
    // Setup search term debounce
    const searchSub = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.applyFiltersLocally();
    });
    this.subscriptions.push(searchSub);
    
    // Setup customer search debounce
    const customerSearchSub = this.customerSearchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.filterCustomers();
    });
    this.subscriptions.push(customerSearchSub);
  }

  onSearchChange(): void {
    this.searchTerms.next(this.searchTerm);
  }

  onCustomerSearchChange(): void {
    this.customerSearchTerms.next(this.customerSearchTerm);
  }

  filterTransactions(): void {
    this.applyFiltersLocally();
  }

  filterCustomers(): void {
    if (!this.customerSearchTerm.trim()) {
      this.filteredCustomers = [...this.customers];
      return;
    }
    
    const searchTerm = this.customerSearchTerm.toLowerCase();
    this.filteredCustomers = this.customers.filter(customer => 
      customer.fullName.toLowerCase().includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
      (customer.phoneNumber && customer.phoneNumber.toString().toLowerCase().includes(searchTerm))
    );
  }

  loadCustomers(): void {
    this.loading = true;
    const customerSub = this.customerService.getCustomers().pipe(
      finalize(() => this.loading = false),
      catchError(error => {
        console.error('Error loading customers:', error);
        return of({ customers: [] });
      })
    ).subscribe({
      next: (response) => {
        if (response && response.customers) {
          this.customers = response.customers;
          this.filteredCustomers = [...this.customers]; // Initialize filtered list
        } else {
          console.error('Invalid customer response:', response);
          this.customers = [];
          this.filteredCustomers = [];
        }
      }
    });
    
    this.subscriptions.push(customerSub);
  }

  loadAllTransactions(): void {
    this.loading = true;
    
    // Get all transactions without pagination
    const params: any = {
      limit: 1000 // Large limit to get all transactions or adjust based on your needs
    };

    const transactionSub = this.transactionService.getTransactions(params).pipe(
      finalize(() => this.loading = false),
      catchError(error => {
        console.error('Error loading transactions:', error);
        return of({ data: [] });
      })
    ).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.allTransactions = response.data;
          this.applyFiltersLocally(); // Apply initial filtering
        } else {
          console.error('Invalid transaction response:', response);
          this.allTransactions = [];
          this.applyFiltersLocally();
        }
      }
    });
    
    this.subscriptions.push(transactionSub);
  }

  // Apply all filters locally
  applyFiltersLocally(): void {
    this.currentPage = 1; // Reset to first page when filtering
    let filteredResults = [...this.allTransactions];
    
    // Apply customer filter
    if (this.selectedCustomerId) {
      filteredResults = filteredResults.filter(transaction => 
        transaction.customer?._id === this.selectedCustomerId || transaction.customerId === this.selectedCustomerId
      );
    }
    
    // Apply transaction type filter
    if (this.selectedType) {
      filteredResults = filteredResults.filter(transaction => transaction.type === this.selectedType);
    }
    
    // Apply payment method filter
    if (this.selectedPaymentMethod) {
      filteredResults = filteredResults.filter(transaction => transaction.paymentMethod === this.selectedPaymentMethod);
    }
    
    // Apply bank name filter
    if (this.selectedBankName && this.selectedPaymentMethod === PaymentMethod.BANK_TRANSFER) {
      filteredResults = filteredResults.filter(transaction => transaction.bankName === this.selectedBankName);
    }
    
    // Apply date range filters
    if (this.startDate) {
      const startDate = new Date(this.startDate);
      startDate.setHours(0, 0, 0, 0);
      filteredResults = filteredResults.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate;
      });
    }
    
    if (this.endDate) {
      const endDate = new Date(this.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredResults = filteredResults.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate <= endDate;
      });
    }
    
    // Apply search term
    if (this.searchTerm && this.searchTerm.trim()) {
      const search = this.searchTerm.trim().toLowerCase();
      filteredResults = filteredResults.filter(transaction => {
        return (
          (transaction.customer?.fullName && transaction.customer.fullName.toLowerCase().includes(search)) ||
          (transaction.Reference && transaction.Reference.toLowerCase().includes(search)) ||
          (transaction.bankName && transaction.bankName.toLowerCase().includes(search)) ||
          (transaction.paymentMethod && transaction.paymentMethod.toLowerCase().includes(search))
        );
      });
    }
    
    // Store all filtered transactions
    this.filteredTransactions = filteredResults;
    
    // Update pagination data
    this.totalItems = this.filteredTransactions.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Apply pagination
    this.applyPagination();
    
    // Calculate statistics on filtered data
    this.calculateStatistics();
  }
  
  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    this.transactions = this.filteredTransactions.slice(startIndex, endIndex);
  }

  resetFilters(): void {
    this.selectedCustomerId = '';
    this.selectedType = '';
    this.selectedPaymentMethod = '';
    this.selectedBankName = '';
    this.startDate = '';
    this.endDate = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFiltersLocally();
  }

  // Helper method to format date for display
  formatDateForApi(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString();
  }

  calculateStatistics(): void {
    // Calculate statistics based on filtered transactions
    this.totalTransactions = this.filteredTransactions.length;
    
    // Calculate total amount from filtered data
    this.totalAmount = this.filteredTransactions.reduce((sum, transaction) => {
      if (transaction.type === TransactionType.PAYMENT) {
        return sum + transaction.amount;
      } else if (transaction.type === TransactionType.CREDIT_NOTE) {
        return sum - transaction.amount;
      } else {
        return sum + transaction.amount;
      }
    }, 0);
    
    // Calculate average
    this.averageTransaction = this.totalTransactions > 0 ? 
      this.totalAmount / this.totalTransactions : 0;
  }

  openModal(): void {
    this.showModal = true;
    this.isEditMode = false;
    this.customerSearchTerm = '';
    this.filteredCustomers = [...this.customers]; // Reset filtered customers
    
    // Set default values for new transaction
    this.transactionForm = {
      type: TransactionType.PAYMENT,
      amount: 0,
      paymentMethod: PaymentMethod.CASH,
      bankName: '',
      Reference: '',
      date: new Date() // Set default date to today
    };
  }

  closeModal(): void {
    this.showModal = false;
  }

  openEditModal(transaction: any): void {
    this.customerSearchTerm = '';
    this.filteredCustomers = [...this.customers]; // Reset filtered customers
    
    // Format date properly if it exists
    let transactionDate = transaction.date ? 
      new Date(transaction.date) : 
      new Date();
    
    this.transactionForm = {
      _id: transaction._id,
      customerId: transaction.customer?._id || transaction.customerId,
      type: transaction.type,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      bankName: transaction.bankName || '',
      Reference: transaction.Reference || '',
      date: transactionDate
    };
    this.showModal = true;
    this.isEditMode = true;
  }

  viewTransactionDetails(transaction: any): void {
    this.selectedTransaction = transaction;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedTransaction = null;
  }

  addTransaction(): void {
    if (!this.transactionForm.customerId) {
      alert("Please select a customer.");
      return;
    }

    if (!this.validateTransactionForm()) {
      return;
    }

    this.loading = true;
    const newTransaction: Partial<Transaction> = this.prepareTransactionData();

    const addSub = this.transactionService.addTransaction(newTransaction as any).pipe(
      finalize(() => this.loading = false),
      catchError(error => {
        console.error('Error adding transaction:', error);
        alert('Failed to add transaction. Please try again.');
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.closeModal();
          // Add the new transaction to our local array and reapply filters
          if (response._id) {
            // Find customer details to include in transaction
            const customer = this.customers.find(c => c._id === newTransaction.customerId);
            const transactionWithCustomer = {
              ...response,
              customer: customer
            };
            this.allTransactions.unshift(transactionWithCustomer);
            this.applyFiltersLocally();
          }
        }
      }
    });
    
    this.subscriptions.push(addSub);
  }

  updateTransaction(): void {
    if (!this.transactionForm.customerId) {
      alert("Please select a customer.");
      return;
    }

    if (!this.validateTransactionForm()) {
      return;
    }

    this.loading = true;
    const updatedTransaction: Partial<Transaction> = this.prepareTransactionData();

    const updateSub = this.transactionService.updateTransaction(updatedTransaction._id!, updatedTransaction as any).pipe(
      finalize(() => this.loading = false),
      catchError(error => {
        console.error('Error updating transaction:', error);
        alert('Failed to update transaction. Please try again.');
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.closeModal();
          
          // Update in our local array
          const index = this.allTransactions.findIndex(t => t._id === updatedTransaction._id);
          if (index !== -1) {
            const customer = this.customers.find(c => c._id === updatedTransaction.customerId);
            this.allTransactions[index] = {
              ...response,
              customer: customer
            };
            this.applyFiltersLocally();
          }
        }
      }
    });
    
    this.subscriptions.push(updateSub);
  }

  validateTransactionForm(): boolean {
    if (this.transactionForm.amount === undefined || this.transactionForm.amount <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return false;
    }

    if (this.transactionForm.paymentMethod === PaymentMethod.BANK_TRANSFER && !this.transactionForm.bankName) {
      alert("Please select a bank for bank transfers.");
      return false;
    }

    return true;
  }

  prepareTransactionData(): Partial<Transaction> {
    const transaction: Partial<Transaction> = {
      _id: this.isEditMode ? this.transactionForm._id : undefined,
      customerId: this.transactionForm.customerId,
      type: this.transactionForm.type!,
      amount: this.transactionForm.amount!,
      paymentMethod: this.transactionForm.paymentMethod!,
      Reference: this.transactionForm.Reference,
      date: this.transactionForm.date
    };

    // Add bank name only if payment method is bank transfer
    if (this.transactionForm.paymentMethod === PaymentMethod.BANK_TRANSFER) {
      transaction.bankName = this.transactionForm.bankName;
    }

    return transaction;
  }

  deleteTransaction(id: string): void {
    if (confirm("Are you sure you want to delete this transaction?")) {
      this.loading = true;
      const deleteSub = this.transactionService.deleteTransaction(id).pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          console.error('Error deleting transaction:', error);
          alert('Failed to delete transaction. Please try again.');
          return of(null);
        })
      ).subscribe({
        next: (response) => {
          if (response !== null) {
            // Remove from our local array
            const index = this.allTransactions.findIndex(t => t._id === id);
            if (index !== -1) {
              this.allTransactions.splice(index, 1);
              this.applyFiltersLocally();
            }
          }
        }
      });
      
      this.subscriptions.push(deleteSub);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  // Helper method to generate array for pagination buttons
  getPaginationArray(): number[] {
    const pages: number[] = [];
    
    // Logic to show limited number of page buttons
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Method to calculate CSS class based on transaction type
  getTypeClass(type: string): string {
    switch (type) {
      case TransactionType.PAYMENT:
        return 'bg-green-100 text-green-800';
      case TransactionType.CREDIT_NOTE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  // Method to calculate CSS class based on transaction amount display
  getAmountClass(type: string): string {
    switch (type) {
      case TransactionType.PAYMENT:
        return 'text-green-600';
      case TransactionType.CREDIT_NOTE:
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  }

  // Check if bank name should be displayed
  shouldShowBankName(paymentMethod: string): boolean {
    return paymentMethod === PaymentMethod.BANK_TRANSFER;
  }
}