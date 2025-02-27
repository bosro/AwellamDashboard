import { Component, OnInit } from '@angular/core';
import { ExpenseTypeService, ExpenseType } from '../../../services/expenseType.service';

@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html'  // Make sure this file exists
})
export class ExpenseTypeComponent implements OnInit {
  expenseTypes: ExpenseType[] = [];
  selectedExpenseType: ExpenseType | null = null;
  isModalOpen = false;
  isLoading = false;
  error = '';

  constructor(private expenseTypeService: ExpenseTypeService) { }

  ngOnInit(): void {
    this.loadExpenseTypes();
  }

  loadExpenseTypes(): void {
    this.isLoading = true;
    this.expenseTypeService.getAll().subscribe({
      next: (response) => {
        this.expenseTypes = response.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load expense types';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  openCreateModal(): void {
    this.selectedExpenseType = null;
    this.isModalOpen = true;
  }

  openEditModal(expenseType: ExpenseType): void {
    this.selectedExpenseType = { ...expenseType };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedExpenseType = null;
  }

  handleSave(expenseType: ExpenseType): void {
    if (this.selectedExpenseType && this.selectedExpenseType._id) {
      this.expenseTypeService.update(this.selectedExpenseType._id, expenseType).subscribe({
        next: () => {
          this.loadExpenseTypes();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to update expense type';
          console.error(err);
        }
      });
    } else {
      this.expenseTypeService.create(expenseType).subscribe({
        next: () => {
          this.loadExpenseTypes();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to create expense type';
          console.error(err);
        }
      });
    }
  }

  deleteExpenseType(id: string): void {
    if (confirm('Are you sure you want to delete this expense type?')) {
      this.expenseTypeService.delete(id).subscribe({
        next: () => {
          this.loadExpenseTypes();
        },
        error: (err) => {
          this.error = 'Failed to delete expense type';
          console.error(err);
        }
      });
    }
  }
}