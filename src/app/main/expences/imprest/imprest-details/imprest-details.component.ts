import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Imprest } from '../imprest.model';
import { ImprestService } from '../../../../services/imprest.service';
import { ExpenseService, Expense } from '../../../../services/expense.service';
import { ExpenseTypeService } from '../../../../services/expenseType.service'
import { TruckService } from '../../../../services/truck.service';
import * as XLSX from 'xlsx';

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
  Math = Math;
  
  // Track expenses and balances 
  totalExpensesSum: number = 0;
  remainingBalance: number = 0;
  
  // Pagination properties
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  paginatedExpenses: any[] = [];

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
    this.loadExpenseTypes();
  }

  loadImprestDetail(): void {
    this.loading = true;
    this.imprestService.getImprestById(this.imprestId).subscribe({
      next: (response) => {
        if (response.success) {
          this.imprestDetail = response.data;
          this.calculateExpensesAndBalance();
          this.updatePagination();
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

  calculateExpensesAndBalance(): void {
    if (!this.imprestDetail || !this.imprestDetail.expenses) return;
    
    // Sort expenses by date
    this.imprestDetail.expenses.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate total expenses
    this.totalExpensesSum = this.imprestDetail.expenses.reduce((sum: number, expense: any) => {
      return sum + expense.amount;
    }, 0);
    
    // Calculate remaining balance based on INITIAL amount
    this.remainingBalance = (this.imprestDetail.amount+ this.imprestDetail.carryforward) - this.totalExpensesSum;
    
    // Assign running balance to each expense starting from INITIAL amount
    let runningBalance = this.imprestDetail.amount+this.imprestDetail.carryforward;
    
    this.imprestDetail.expenses.forEach((expense: any) => {
      runningBalance -= expense.amount;
      expense.runningBalance = runningBalance;
    });
  }

  updatePagination(): void {
    if (!this.imprestDetail || !this.imprestDetail.expenses) return;
    
    this.totalPages = Math.ceil(this.imprestDetail.expenses.length / this.itemsPerPage);
    this.setPage(this.currentPage);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages || !this.imprestDetail) return;
    
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.imprestDetail.expenses.length);
    this.paginatedExpenses = this.imprestDetail.expenses.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.setPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.setPage(this.currentPage + 1);
    }
  }

  exportToExcel(): void {
    if (!this.imprestDetail) return;

    // Create header with imprest information
    const imprestInfo = [
      ['Imprest Details'],
      [''],
      ['Description', this.imprestDetail.description],
      ['Date', this.formatDate(this.imprestDetail.date)],
      ['Initial Amount', this.imprestDetail.amount],
      ['Total Expenses', this.totalExpensesSum],
      ['Remaining Balance', this.remainingBalance],
      ['Status', this.imprestDetail.status],
      ['Created', this.formatDate(this.imprestDetail.createdAt)],
      ['']  // Empty row for spacing
    ];

    // Create expense data for export
    const expenseHeaders = ['Date', 'Description', 'Account Type', 'Recipient', 'Amount', 'Status', 'Truck', 'Running Balance'];
    
    const expenseData = this.imprestDetail.expenses.map((expense: any) => [
      this.formatDate(expense.date),
      expense.description,
      expense.accountType,
      expense.recipient,
      expense.amount,
      expense.status,
      expense.truckId ? `${expense.truckId.truckNumber} ${expense.truckId.driver ? `(${expense.truckId.driver.name})` : ''}` : 'N/A',
      expense.runningBalance
    ]);

    // Combine headers and data
    const exportData = [
      ...imprestInfo,
      ['Expenses'],
      expenseHeaders,
      ...expenseData
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);

    // Style the header rows
    const headerRange = XLSX.utils.decode_range('A1:B1');  // Imprest Details header
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = { font: { bold: true, sz: 14 } };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Imprest Details');

    // Save the workbook
    const fileName = `Imprest_${this.imprestDetail.description.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
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