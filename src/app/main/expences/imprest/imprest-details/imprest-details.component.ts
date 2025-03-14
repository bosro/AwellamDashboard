// src/app/components/imprest-detail/imprest-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Imprest } from '../imprest.model';
import { ImprestService } from '../../../../services/imprest.service';
import { ExpenseService, Expense } from '../../../../services/expense.service';
import { ExpenseTypeService } from '../../../../services/expenseType.service'
import { TruckService } from '../../../../services/truck.service';

@Component({
  selector: 'app-imprest-detail',
  templateUrl: './imprest-details.component.html'
})
export class ImprestDetailComponent implements OnInit {
  imprestDetail: any | null = null;
  selectedExpense: any = null;
  isModalOpen = false;
  loading = true;
  error = '';
  imprestId: string = '';
  trucks: any[] = [];
  expenseTypes: any[] = [];

  constructor(
    private imprestService: ImprestService,
    private expenseTypeService: ExpenseTypeService,
    private truckService: TruckService,
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.imprestId = params['id'];
        this.loadImprestDetail();
      } else {
        this.error = 'No imprest ID provided';
        this.loading = false;
      }
    });
    this.loadTrucks();
    this.loadExpenseTypes()
  }

  loadImprestDetail(): void {
    this.loading = true;
    this.imprestService.getImprestById(this.imprestId).subscribe({
      next: (response) => {
        if (response.success) {
          this.imprestDetail = response.data;
        } else {
          this.error = 'Failed to load imprest details';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading imprest details: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }
  openEditModal(expense: any): void {
    this.selectedExpense = { ...expense };
    this.isModalOpen = true;
  }
  goBack(): void {
    this.router.navigate(['/main/expenses/imprest']);
  }

  editImprest(): void {
    this.router.navigate(['/main/expenses/imprest/edit', this.imprestId]);
  }

  deleteImprest(): void {
    if (confirm('Are you sure you want to delete this imprest?')) {
      this.imprestService.deleteImprest(this.imprestId).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/main/expenses/imprest']);
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

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.delete(id).subscribe({
        next: () => {
          this.loadImprestDetail();
        },
        error: (err) => {
          this.error = 'Failed to delete expense';
          console.error(err);
        }
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedExpense = null;
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


  handleSave(expense: any): void {
    if (this.selectedExpense && this.selectedExpense._id) {
      this.expenseService.update(this.selectedExpense._id, expense).subscribe({
        next: () => {
          this.loadImprestDetail();
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
          this.loadImprestDetail();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to create expense';
          console.error(err);
        }
      });
    }
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'GHC' });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}