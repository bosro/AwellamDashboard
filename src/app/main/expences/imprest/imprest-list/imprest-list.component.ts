// src/app/components/imprest-list/imprest-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Imprest } from '../imprest.model';
import { ImprestService } from '../../../../services/imprest.service';
import { ExpenseTypeService } from '../../../../services/expenseType.service'
import { ExpenseService, Expense } from '../../../../services/expense.service';
import { TruckService } from '../../../../services/truck.service';


@Component({
  selector: 'app-imprest-list',
  templateUrl: './imprest-list.component.html'
})
export class ImprestListComponent implements OnInit {
  imprests!: any[];
  loading = true;
  error = '';
  selectedExpense: any = null;
  isModalOpen = false;
  expenseTypes: any[] = [];
  trucks: any[] = [];

  constructor(
    private imprestService: ImprestService,
     private expenseService: ExpenseService,
        private expenseTypeService: ExpenseTypeService,
        private truckService: TruckService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadImprests();
    this.loadExpenseTypes();
    this.loadTrucks();
  }

  loadImprests(): void {
    this.loading = true;
    this.imprestService.getAllImprests().subscribe({
      next: (response) => {
        if (response.success) {
          this.imprests = response.data;
        } else {
          this.error = 'Failed to load imprests';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading imprests: ' + (err.message || 'Unknown error');
        this.loading = false;
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

  viewDetails(id: string): void {
    this.router.navigate(['/main/expenses/imprest', id]);
  }

  editImprest(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/main/expenses/imprest/edit', id]);
  }

  deleteImprest(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this imprest?')) {
      this.imprestService.deleteImprest(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadImprests();
          } else {
            this.error = 'Failed to delete imprest';
          }
        },
        error: (err) => {
          this.error = 'Error deleting imprest: ' + (err.message || 'Unknown error');
        }
      });
    }
  }

  openCreateModal(): void {
    this.selectedExpense = null;
    this.isModalOpen = true;
  }

  createNewImprest(): void {
    this.router.navigate(['/main/expenses/imprest/create']);
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString();
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

          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to create expense';
          console.error(err);
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'GHC' });
  }
}