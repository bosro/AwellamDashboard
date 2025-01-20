import { Component, OnInit } from '@angular/core';
import { PurchasingService, Purchase } from '../../../services/purchasing.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchasing-list.component.html',
  styleUrls: ['./purchasing-list.component.css']
})
export class PurchaseListComponent implements OnInit {
  purchases: Purchase[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';

  Math = Math;
  
  constructor(
    private purchasingService: PurchasingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm
    };

    this.purchasingService.getPurchases(params).subscribe({
      next: (response) => {
        this.purchases = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPurchases();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadPurchases();
  }

  getStatusClass(status: string): string {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status as keyof typeof classes] || '';
  }

  deletePurchase(id: number): void {
    if (confirm('Are you sure you want to delete this purchase?')) {
      this.loading = true;
      this.purchasingService.deletePurchase(id).subscribe({
        next: () => {
          this.loadPurchases(); // Reload the list after deletion
        },
        error: (error) => {
          console.error('Error deleting purchase:', error);
          this.loading = false;
        }
      });
    }
  }
}