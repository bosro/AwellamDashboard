// Component: src/app/expense/components/expense-list/expense-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ExpenseService, Expense } from '../../../services/expense.service';
import { ExpenseTypeService } from '../../../services/expenseType.service'
import { TruckService } from '../../../services/truck.service';
@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.html',
//   styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  selectedExpense: any = null;
  isModalOpen = false;
  isLoading = false;
  error = '';
  trucks: any[] = [];
  expenseTypes: any[] = [];

  constructor(
    private expenseService: ExpenseService,
    private expenseTypeService: ExpenseTypeService,
    private truckService: TruckService
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
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load expenses';
        this.isLoading = false;
        console.error(err);
      }
    });
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