import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseTypeService } from '../../../services/expenseType.service';

@Component({
  selector: 'app-expense-dashboard',
  templateUrl: './expensedashboard.html',
//   styleUrls: ['./expense-dashboard.component.scss']
})
export class ExpenseDashboardComponent implements OnInit {
  expenses: any[] = [];
  expenseTypes: any[] = [];
  isLoading = true;
  error = '';
  
  // Summary metrics
  totalExpenses = 0;
  pendingExpenses = 0;
  approvedExpenses = 0;
  rejectedExpenses = 0;
  
  // Chart data
  monthlyExpenseData: any[] = [];
  categoryExpenseData: any[] = [];
  
  // Recent expenses
  recentExpenses: any[] = [];
  
  // Date filters
  startDate: Date = new Date();
  endDate: Date = new Date();
  
  constructor(
    private expenseService: ExpenseService,
    private expenseTypeService: ExpenseTypeService
  ) {
    // Set default date range to last 30 days
    this.startDate.setDate(this.startDate.getDate() - 30);
  }

  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.isLoading = true;
    
    // Load expense types
    this.expenseTypeService.getAll().subscribe({
      next: (response) => {
        this.expenseTypes = response.data || [];
        this.loadExpenses();
      },
      error: (err) => {
        this.error = 'Failed to load expense types';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  
  loadExpenses(): void {
    this.expenseService.getAll().subscribe({
      next: (response) => {
        this.expenses = response.data || [];
        this.calculateMetrics();
        this.prepareChartData();
        this.getRecentExpenses();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load expenses';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  
  calculateMetrics(): void {
    this.totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    this.pendingExpenses = this.expenses
      .filter(exp => exp.status === 'pending')
      .reduce((sum, exp) => sum + exp.amount, 0);
      
    this.approvedExpenses = this.expenses
      .filter(exp => exp.status === 'approved')
      .reduce((sum, exp) => sum + exp.amount, 0);
      
    this.rejectedExpenses = this.expenses
      .filter(exp => exp.status === 'rejected')
      .reduce((sum, exp) => sum + exp.amount, 0);
  }
  
  prepareChartData(): void {
    // Prepare monthly expenses data
    const monthlyData: {[key: string]: number} = {};
    
    this.expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += exp.amount;
    });
    
    this.monthlyExpenseData = Object.keys(monthlyData).map(key => ({
      name: key,
      value: monthlyData[key]
    })).sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/').map(Number);
      const [bMonth, bYear] = b.name.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
    
    // Prepare category expenses data
    const categoryData: {[key: string]: number} = {};
    
    this.expenses.forEach(exp => {
      const typeName = exp.expenseType?.name || 'Uncategorized';
      
      if (!categoryData[typeName]) {
        categoryData[typeName] = 0;
      }
      
      categoryData[typeName] += exp.amount;
    });
    
    this.categoryExpenseData = Object.keys(categoryData).map(key => ({
      name: key,
      value: categoryData[key]
    })).sort((a, b) => b.value - a.value);
  }
  
  getRecentExpenses(): void {
    // Get 5 most recent expenses
    this.recentExpenses = [...this.expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
  
  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  refreshData(): void {
    this.loadData();
  }
}