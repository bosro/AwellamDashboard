import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-debtors',
  templateUrl: './debtors-list.component.html',
//   styleUrls: ['./debtors.component.css']
})
export class DebtorsComponent implements OnInit {
  debtors: any[] = [];
  filteredDebtors: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;
  loading: boolean = false;
  Math=Math
  private searchTerms = new Subject<string>();

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadDebtors();
  }

  setupSearchDebounce(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.searchDebtors();
    });
  }

  onSearchChange(): void {
    this.searchTerms.next(this.searchTerm);
  }


  getDebtors(){
    this.transactionService.getDebtors().subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `debtors-list.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting debtors:', error)
    });
  }
  loadDebtors(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm
    };
  
    this.transactionService.getDebtorsList<{ data: any[]; totalItems: number }>().subscribe(
      (response) => {
        if (response && response.data) {
          this.debtors = response.data;
          this.filteredDebtors = response.data;
          this.totalItems = response.totalItems || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading debtors:', error);
        this.loading = false;
      }
    );
  }

  searchDebtors(): void {
    this.currentPage = 1; // Reset to the first page
    this.loadDebtors();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDebtors();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDebtors();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDebtors();
    }
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}