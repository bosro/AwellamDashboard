import { Component, OnInit } from '@angular/core';
import { CustomersService } from '../../../services/customer.service';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction, TransactionType, PaymentMethod } from '../../../../types';
import { Customer } from '../../../shared/types/customer.interface';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionComponent implements OnInit {
  // Data collections
  customers: Customer[] = [];
  transactions: any[] = [];
  
  // Filter variables
  selectedCustomerId: string = '';
  selectedType: string = '';
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';
  Math = Math;
  
  // Search debounce
  private searchTerms = new Subject<string>();
  
  // Form data
  transactionForm: Partial<Transaction> = {
    type: TransactionType.PURCHASE,
    amount: 0,
    paymentMethod: PaymentMethod.CASH,
    paymentReference: ''
  };
  
  // Modal states
  showModal: boolean = false;
  showDetailsModal: boolean = false;
  isEditMode: boolean = false;
  selectedTransaction: any | null = null;
  
  // Dropdown options
  transactionTypes = Object.values(TransactionType);
  paymentMethods = Object.values(PaymentMethod);
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  
  // Statistics
  totalTransactions: number = 0;
  totalAmount: number = 0;
  averageTransaction: number = 0;

  constructor(
    private customerService: CustomersService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.setupSearchDebounce();
    this.loadTransactions();
  }

  setupSearchDebounce(): void {
    this.searchTerms.pipe(
      // Wait 300ms after each keystroke before considering the term
      debounceTime(300),
      
      // Ignore if the search term is the same as the previous
      distinctUntilChanged(),
    ).subscribe(() => {
      this.searchTransactions();
    });
  }

  onSearchChange(): void {
    this.searchTerms.next(this.searchTerm);
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe(response => {
      if (response && response.customers) {
        this.customers = response.customers;
      } else {
        console.error('Invalid customer response:', response);
        this.customers = [];
      }
    }, error => {
      console.error('Error loading customers:', error);
      this.customers = [];
    });
  }

  loadTransactions(): void {
    // Create filter parameters
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add optional filters if they have values
    if (this.selectedCustomerId) {
      params.customerId = this.selectedCustomerId;
    }
    
    if (this.selectedType) {
      params.type = this.selectedType;
    }
    
    if (this.startDate) {
      params.startDate = this.startDate;
    }
    
    if (this.endDate) {
      params.endDate = this.endDate;
    }
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    // Call API with proper parameters
    this.transactionService.getTransactions(params).subscribe(
      response => {
        if (response && response.data) {
          this.transactions = response.data;
          this.totalPages = response.totalPages || 1;
          this.totalItems = response.totalItems || 0;
          
          // Calculate statistics
          this.calculateStatistics(response.data);
        } else {
          console.error('Invalid transaction response:', response);
          this.transactions = [];
          this.totalPages = 1;
          this.totalItems = 0;
          this.resetStatistics();
        }
      }, 
      error => {
        console.error('Error loading transactions:', error);
        this.transactions = [];
        this.totalPages = 1;
        this.totalItems = 0;
        this.resetStatistics();
      }
    );
  }

  resetStatistics(): void {
    this.totalTransactions = 0;
    this.totalAmount = 0;
    this.averageTransaction = 0;
  }

  calculateStatistics(transactions: any[]): void {
    this.totalTransactions = this.totalItems;
    
    // Calculate total amount
    this.totalAmount = transactions.reduce((sum, transaction) => {
      if (transaction.type === TransactionType.PAYMENT) {
        return sum + transaction.amount;
      } else if (transaction.type === TransactionType.REFUND) {
        return sum + transaction.amount;
      } else {
        return sum + transaction.amount;
      }
    }, 0);
    
    // Calculate average
    this.averageTransaction = transactions.length > 0 ? 
      this.totalAmount / transactions.length : 0;
  }

  filterTransactions(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadTransactions();
  }

  searchTransactions(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.loadTransactions();
  }

  resetFilters(): void {
    this.selectedCustomerId = '';
    this.selectedType = '';
    this.startDate = '';
    this.endDate = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadTransactions();
  }

  openModal(): void {
    this.showModal = true;
    this.isEditMode = false;
    this.transactionForm = {
      type: TransactionType.PURCHASE,
      amount: 0,
      paymentMethod: PaymentMethod.CASH,
      paymentReference: ''
    };
  }

  closeModal(): void {
    this.showModal = false;
  }

  openEditModal(transaction: any): void {
    this.transactionForm = {
      _id: transaction._id,
      customerId: transaction.customer?._id || transaction.customerId,
      type: transaction.type,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      paymentReference: transaction.paymentReference || ''
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

    const newTransaction: Partial<Transaction> = {
      customerId: this.transactionForm.customerId,
      type: this.transactionForm.type!,
      amount: this.transactionForm.amount!,
      paymentMethod: this.transactionForm.paymentMethod!,
      paymentReference: this.transactionForm.paymentReference
    };

    this.transactionService.addTransaction(newTransaction as any).subscribe(
      transaction => {
        this.closeModal();
        this.loadTransactions(); // Reload to get updated list
      },
      error => {
        console.error('Error adding transaction:', error);
        alert('Failed to add transaction. Please try again.');
      }
    );
  }

  updateTransaction(): void {
    if (!this.transactionForm.customerId) {
      alert("Please select a customer.");
      return;
    }

    const updatedTransaction: Partial<Transaction> = {
      _id: this.transactionForm._id,
      customerId: this.transactionForm.customerId,
      type: this.transactionForm.type!,
      amount: this.transactionForm.amount!,
      paymentMethod: this.transactionForm.paymentMethod!,
      paymentReference: this.transactionForm.paymentReference
    };

    this.transactionService.updateTransaction(updatedTransaction._id!, updatedTransaction as any).subscribe(
      transaction => {
        this.closeModal();
        this.loadTransactions(); // Reload to get updated list
      },
      error => {
        console.error('Error updating transaction:', error);
        alert('Failed to update transaction. Please try again.');
      }
    );
  }

  deleteTransaction(id: string): void {
    if (confirm("Are you sure you want to delete this transaction?")) {
      this.transactionService.deleteTransaction(id).subscribe(
        () => {
          this.loadTransactions(); // Reload to get updated list
        },
        error => {
          console.error('Error deleting transaction:', error);
          alert('Failed to delete transaction. Please try again.');
        }
      );
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTransactions();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTransactions();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
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
      case TransactionType.REFUND:
        return 'bg-red-100 text-red-800';
      case TransactionType.PURCHASE:
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  // Method to calculate CSS class based on transaction amount display
  getAmountClass(type: string): string {
    switch (type) {
      case TransactionType.PAYMENT:
        return 'text-green-600';
      case TransactionType.REFUND:
        return 'text-red-600';
      case TransactionType.PURCHASE:
      default:
        return 'text-blue-600';
    }
  }
}