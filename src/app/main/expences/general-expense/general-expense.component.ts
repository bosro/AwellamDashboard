import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../../services/expense.service';
import { formatDate } from '@angular/common';

interface Expense {
  _id: string;
  description: string;
  expenseType: {
    _id: string;
    name: string;
  } | null;
  amount: number;
  recipient: string;
  status: string;
  date: string;
  createdAt: string;
}

@Component({
  selector: 'app-general-expense',
  templateUrl: './general-expense.component.html',
//   styleUrls: ['./general-expense.component.scss']
})
export class GeneralExpenseComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  isLoading = false;
  error = '';
  searchTerm = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  paginatedExpenses: Expense[] = [];
  pageSizeOptions = [5, 10, 25, 50];

  // Sorting
  sortField: keyof Expense = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadGeneralExpenses();
  }

  loadGeneralExpenses(): void {
    this.isLoading = true;
    this.error = '';
    
    this.expenseService.getGeneralExpense().subscribe({
      next: (response) => {
        if (response.success) {
          this.expenses = response.data || [];
          this.filteredExpenses = [...this.expenses];
          this.sortExpenses();
          this.updatePagination();
        } else {
          this.error = response.message || 'Failed to load expenses';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load expenses. Please try again later.';
        this.isLoading = false;
        console.error('Error loading general expenses:', err);
      },
    });
  }

  sortExpenses(): void {
    this.filteredExpenses.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Handle nested properties for expenseType
      if (this.sortField === 'expenseType') {
        valueA = a.expenseType?.name || '';
        valueB = b.expenseType?.name || '';
      } else {
        valueA = a[this.sortField];
        valueB = b[this.sortField];
      }

      // Handle dates
      if (this.sortField === 'date' || this.sortField === 'createdAt') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      // Compare values based on sort direction
      if (this.sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredExpenses.length / this.pageSize);

    // Ensure current page is within valid range
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1; // Default to 1 if totalPages is 0
    }

    // Calculate start and end index
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Get the paginated data
    this.paginatedExpenses = this.filteredExpenses.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  get pageNumbers(): number[] {
    const visiblePages = 5;
    const pages: number[] = [];
    
    let startPage = Math.max(1, this.currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + visiblePages - 1);
    
    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  changePageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.currentPage = 1;
    this.updatePagination();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  }

  sortBy(field: keyof Expense): void {
    if (this.sortField === field) {
      // Toggle sort direction if clicking the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field and default to descending
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    
    this.sortExpenses();
  }

  getSortIcon(field: keyof Expense): string {
    if (this.sortField !== field) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.filteredExpenses = [...this.expenses];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredExpenses = this.expenses.filter(expense => 
        expense.description?.toLowerCase().includes(term) ||
        expense.recipient?.toLowerCase().includes(term) ||
        expense.expenseType?.name?.toLowerCase().includes(term) ||
        expense.status?.toLowerCase().includes(term) ||
        expense.amount.toString().includes(term)
      );
    }
    
    this.currentPage = 1;
    this.sortExpenses();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.search();
  }

  refreshData(): void {
    this.loadGeneralExpenses();
  }
}