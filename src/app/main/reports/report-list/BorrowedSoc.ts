import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface BorrowedSoc {
  _id: string;
  socNumber: string;
  quantity: number;
  totalquantity: number;
  plantId: string;
  destinationId: string;
  productId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  assignedTruck?: string;
  assignedOrder?: string;
  borrowedOrder: boolean;
  recipient?: string;
}

interface BorrowedSocResponse {
  message: string;
  borrowedSocs: BorrowedSoc[];
}

@Component({
  selector: 'app-borrowed-soc',
  templateUrl: './BorrowedSoc.html'
})
export class BorrowedSocComponent implements OnInit {
  borrowedSocs: BorrowedSoc[] = [];
  filteredSocs: BorrowedSoc[] = [];
  socNumberFilter = new FormControl('');
  
  // Pagination properties
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  Math =Math
  
  loading = false;
  error = '';
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchBorrowedSocs();
    
    // Set up filter with debounce
    this.socNumberFilter.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.filterSocs(value);
        this.currentPage = 1; // Reset to first page when filtering
      });
  }

  fetchBorrowedSocs(): void {
    this.loading = true;
    this.http.get<BorrowedSocResponse>(`${environment.apiUrl}/soc/get/borrowed`)
      .subscribe({
        next: (response) => {
          this.borrowedSocs = response.borrowedSocs;
          this.filteredSocs = [...this.borrowedSocs];
          this.updatePagination();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load borrowed SOCs. Please try again later.';
          console.error('Error fetching borrowed SOCs:', err);
          this.loading = false;
        }
      });
  }

  filterSocs(filterValue: string | null): void {
    if (!filterValue) {
      this.filteredSocs = [...this.borrowedSocs];
    } else {
      const filter = filterValue.toLowerCase();
      this.filteredSocs = this.borrowedSocs.filter(soc => 
        soc.socNumber.toLowerCase().includes(filter)
      );
    }
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.filteredSocs.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedSocs(): BorrowedSoc[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSocs.slice(startIndex, startIndex + this.itemsPerPage);
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
    this.socNumberFilter.setValue('');
  }
  
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}