// Component: src/app/expense/components/expense-list/expense-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ExpenseService, Expense } from '../../../services/expense.service';
import { ExpenseTypeService } from '../../../services/expenseType.service'
import { TruckService } from '../../../services/truck.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.html',
//   styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  paginatedExpenses: any[] = [];
  selectedExpense: any = null;
  isModalOpen = false;
  isLoading = false;
  error = '';
  trucks: any[] = [];
  expenseTypes: any[] = [];
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  startIndex: number = 0;
  endIndex: number = 0;
  Math = Math; // Make Math available to the template

  constructor(
    private expenseService: ExpenseService,
    private expenseTypeService: ExpenseTypeService,
    private truckService: TruckService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExpenses();
    this.loadTrucks();
    this.loadExpenseTypes();
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.expenseService.getAll().subscribe({
      next: (response) => {
        this.expenses = response.data || [];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load expenses';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.expenses.length / this.pageSize);
    
    // Ensure current page is within valid range
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1; // Default to 1 if totalPages is 0
    }
    
    // Calculate start and end index
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = this.startIndex + this.pageSize;
    
    // Get the paginated data
    this.paginatedExpenses = this.expenses.slice(this.startIndex, this.endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): (number | any)[] {
    const pages: (number | string)[] = [];
    const totalPagesToShow = 5; // Show at most 5 page numbers
    
    if (this.totalPages <= totalPagesToShow) {
      // If we have 5 or fewer pages, show all
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Determine start and end of displayed pages
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Adjust to ensure we show up to 3 pages in the middle
      if (start == 2) end = Math.min(end + 1, this.totalPages - 1);
      if (end == this.totalPages - 1) start = Math.max(start - 1, 2);
      
      // Add ellipsis if there's a gap after page 1
      if (start > 2) pages.push('...');
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap before the last page
      if (end < this.totalPages - 1) pages.push('...');
      
      // Always show last page
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  loadTrucks(): void {
    this.truckService.getTrucks().subscribe({
      next: (response) => {
        this.trucks = response.trucks || [];
      },
      error: (err) => {
        console.error('Failed to load trucks', err);
      }
    });
  }

  loadExpenseTypes(): void {
    this.expenseTypeService.getAll().subscribe({
      next: (response) => {
        this.expenseTypes = response.expenseTypes || [];
      },
      error: (err) => {
        console.error('Failed to load expense types', err);
      }
    });
  }

  openCreateModal(): void {
    this.selectedExpense = null;
    this.isModalOpen = true;
  }

  openEditModal(expense: any): void {
    this.selectedExpense = { ...expense };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedExpense = null;
  }

  goToExpenseTypes(): void {
    this.router.navigate(['/main/expenses/expense-types']);
  }

  handleSave(expense: any): void {
    if (this.selectedExpense && this.selectedExpense._id) {
      this.expenseService.update(this.selectedExpense._id, expense).subscribe({
        next: () => {
          this.loadExpenses();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to update expense';
          console.error(err);
        }
      });
    } else {
      this.expenseService.create(expense).subscribe({
        next: () => {
          this.loadExpenses();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to create expense';
          console.error(err);
        }
      });
    }
  }

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.delete(id).subscribe({
        next: () => {
          this.loadExpenses();
        },
        error: (err) => {
          this.error = 'Failed to delete expense';
          console.error(err);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}