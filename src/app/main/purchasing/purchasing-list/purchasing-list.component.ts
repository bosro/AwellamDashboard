import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchasingService } from '../../../services/purchasing.service';
import { Purchase, PurchaseResponse } from '../../../services/purchasing.service';

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
      next: (response: PurchaseResponse) => {
        this.purchases = response.purchases;
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

  newPurchase(): void {
    this.router.navigate(['/main/purchasing/new/']);
  }

  viewDetails(purchase: Purchase): void {
    this.router.navigate(['main/purchasing/details', purchase._id]);
  }

  // EditDetails(purchase: Purchase): void {
  //   this.router.navigate(['main/purchasing/details', purchase._id]);
  // }

  deletePurchase(id: string): void {
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