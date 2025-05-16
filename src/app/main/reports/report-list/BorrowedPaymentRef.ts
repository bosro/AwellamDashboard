import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaymentReference, SocNumber } from '../../../services/payment.service';
import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-borrowed-payment-references',
  templateUrl: './BorrowedPaymentRef.html'
})
export class BorrowedPaymentReferencesComponent implements OnInit {
  paymentReferences: PaymentReference[] = [];
  filteredReferences: PaymentReference[] = [];
  paymentRefFilter = new FormControl('');
  
  // Pagination properties
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  
  Math = Math;
  loading = false;
  error = '';

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchBorrowedPaymentReferences();
    
    // Set up filter with debounce
    this.paymentRefFilter.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.filterReferences(value);
        this.currentPage = 1; // Reset to first page when filtering
      });
  }

  fetchBorrowedPaymentReferences(): void {
    this.loading = true;
    this.paymentService.getBorrowedPaymentReferences()
      .subscribe({
        next: (response) => {
          this.paymentReferences = response.paymentReferences;
          this.filteredReferences = [...this.paymentReferences];
          this.updatePagination();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load borrowed payment references. Please try again later.';
          console.error('Error fetching borrowed payment references:', err);
          this.loading = false;
        }
      });
  }

  filterReferences(filterValue: string | null): void {
    if (!filterValue) {
      this.filteredReferences = [...this.paymentReferences];
    } else {
      const filter = filterValue.toLowerCase();
      this.filteredReferences = this.paymentReferences.filter(ref => 
        ref.paymentRef.toLowerCase().includes(filter) || 
        (ref.plantId && ref.plantId.name.toLowerCase().includes(filter))
      );
    }
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.filteredReferences.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedReferences(): PaymentReference[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReferences.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  clearFilter(): void {
    this.paymentRefFilter.setValue('');
  }

  viewDetails(paymentRefId: string): void {
    this.router.navigate(['/main/reports/borrowed-socs', paymentRefId]);
  }

  getSocCount(socNumbers: any[]): number {
    return socNumbers ? socNumbers.length : 0;
  }
}