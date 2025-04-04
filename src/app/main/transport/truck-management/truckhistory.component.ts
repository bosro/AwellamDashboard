// truck-statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TruckService } from '../../../services/truck.service';
import Swal from 'sweetalert2';
import { DeliveredOrder, ExpenseResponse } from '../../../shared/types/truck-operation.types';

@Component({
  selector: 'app-truck-statistics',
  templateUrl: './truckhistory.component.html',
//   styleUrls: ['./truck-statistics.component.scss']
})
export class TruckStatisticsComponent implements OnInit {
  truckId: string = '';
  truck: any | null = null;
  activeTab: 'orders' | 'expenses' = 'orders';
  loading: boolean = true;
  dateFilterForm: FormGroup;
  
  // Data
  deliveredOrders: DeliveredOrder[] = [];
  paginatedOrders: DeliveredOrder[] = [];
  expenses: ExpenseResponse | null = null;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Chart/Table toggles
  showOrdersChart: boolean = false;
  showExpensesChart: boolean = true;
  
  // Make Math available to the template
  Math = Math;
  
  // For expense breakdown
  objectKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private truckService: TruckService,
    private fb: FormBuilder
  ) {
    this.dateFilterForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.truckId = id;
      this.loadTruckDetails(id);
      this.fetchStatistics();
    } else {
      Swal.fire('Error', 'No truck ID provided', 'error');
    }
  }

  loadTruckDetails(truckId: string): void {
    this.truckService.getTruckById(truckId).subscribe({
      next: (response) => {
        this.truck = response.truck;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading truck details:', error);
        this.loading = false;
        Swal.fire('Error', 'Failed to load truck details', 'error');
      }
    });
  }

  setActiveTab(tab: 'orders' | 'expenses'): void {
    this.activeTab = tab;
    // Refetch data only if needed
    if ((tab === 'orders' && this.deliveredOrders.length === 0) || 
        (tab === 'expenses' && !this.expenses)) {
      this.fetchStatistics();
    }
  }

  fetchStatistics(): void {
    this.loading = true;
    
    const startDate = this.dateFilterForm.get('startDate')?.value;
    const endDate = this.dateFilterForm.get('endDate')?.value;
    
    if (this.activeTab === 'orders') {
      this.fetchDeliveredOrders(startDate, endDate);
    } else {
      this.fetchExpenses(startDate, endDate);
    }
  }

  fetchDeliveredOrders(startDate?: string, endDate?: string): void {
    this.truckService.getDeliveredOrders(this.truckId, startDate, endDate).subscribe({
      next: (response) => {
        if (response && response.deliveredOrders) {
          this.deliveredOrders = response.deliveredOrders;
          this.totalPages = Math.ceil(this.deliveredOrders.length / this.pageSize);
          this.currentPage = 1;
          this.updatePaginatedOrders();
        } else {
          this.deliveredOrders = [];
          this.paginatedOrders = [];
          this.totalPages = 1;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching delivered orders:', error);
        this.loading = false;
        Swal.fire('Error', 'Failed to load delivered orders', 'error');
      }
    });
  }

  fetchExpenses(startDate?: string, endDate?: string): void {
    this.truckService.getTruckExpenses(this.truckId, startDate, endDate).subscribe({
      next: (data) => {
        this.expenses = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching expenses:', error);
        this.loading = false;
        Swal.fire('Error', 'Failed to load expense data', 'error');
      }
    });
  }

  applyDateFilter(): void {
    this.fetchStatistics();
  }

  resetDateFilter(): void {
    this.dateFilterForm.reset();
    this.fetchStatistics();
  }

  toggleView(view: 'chart' | 'table', type: 'orders' | 'expenses'): void {
    if (type === 'orders') {
      this.showOrdersChart = view === 'chart';
    } else {
      this.showExpensesChart = view === 'chart';
    }
  }

  // Pagination methods
  updatePaginatedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedOrders = this.deliveredOrders.slice(startIndex, startIndex + this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedOrders();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedOrders();
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    
    if (this.totalPages <= 7) {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Current page is in first 3 pages
      if (this.currentPage <= 3) {
        pages.push(2, 3, 4, '...', this.totalPages - 1, this.totalPages);
      } 
      // Current page is in last 3 pages
      else if (this.currentPage >= this.totalPages - 2) {
        pages.push('...', this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } 
      // Current page is somewhere in the middle
      else {
        pages.push('...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
      }
    }
    
    return pages;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', { 
      style: 'currency', 
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  }

  calculateTotal(orders: DeliveredOrder[]): number {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  getMonthName(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long' }) + ' ' + year;
  }
}