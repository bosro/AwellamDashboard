import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClaimsService, Claim } from '../../../services/claim.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClaimStatus, PaymentStatus } from '../../../shared/types/claim-types';

@Component({
  selector: 'app-claims-list',
  templateUrl: './claim-list.component.html',
  // styleUrls: ['./claim -list.component.css']
})
export class ClaimsListComponent implements OnInit {
  claims: Claim[] = [];
  selectedClaims: Set<number> = new Set();
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  
  showClaimModal = false;
  selectedClaimId?: number;

  filterForm!: FormGroup;
  exportLoading = false;

  statusOptions = ['pending', 'processing', 'approved', 'rejected'];
  paymentStatusOptions = ['unpaid', 'partial', 'paid'];

  protected readonly Math = Math;

  constructor(
    private claimsService: ClaimsService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }


  

  openNewClaimModal(): void {
    this.selectedClaimId = undefined;
    this.showClaimModal = true;
  }

  openEditClaimModal(id: number): void {
    this.selectedClaimId = id;
    this.showClaimModal = true;
  }

  onClaimSaved(): void {
    this.loadClaims();
  }

  toggleSelection(claimId: number): void {
    if (this.selectedClaims.has(claimId)) {
      this.selectedClaims.delete(claimId);
    } else {
      this.selectedClaims.add(claimId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedClaims.size === this.claims.length) {
      this.selectedClaims.clear();
    } else {
      this.claims.forEach(claim => {
        this.selectedClaims.add(claim.id);
      });
    }
  }

  batchProcess(action: string): void {
    if (this.selectedClaims.size === 0) return;

    this.loading = true;
    this.claimsService.batchProcessClaims(
      Array.from(this.selectedClaims),
      action
    ).subscribe({
      next: () => {
        this.selectedClaims.clear();
        this.loadClaims();
      },
      error: (error) => {
        console.error('Error processing claims:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: ClaimStatus): string {
    const classes: Record<ClaimStatus, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    const classes: Record<PaymentStatus, string> = {
      'unpaid': 'bg-red-100 text-red-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800'
    };
    return classes[status] || '';
  }


  clearFilters(): void {
    this.filterForm.reset();
  }

  getTotalSelectedAmount(): number {
    return this.claims
      .filter(claim => this.selectedClaims.has(claim.id))
      .reduce((sum, claim) => sum + claim.totalAmount, 0);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadClaims();
  }

  getPendingCount(): number {
    return this.claims.filter(claim => claim.status === 'pending').length;
  }

  getApprovedCount(): number {
    return this.claims.filter(claim => claim.status === 'approved').length;
  }

  getTotalClaimsValue(): number {
    return this.claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
  }

  generateBatchReport(): void {
    if (this.selectedClaims.size === 0) return;
    
    this.loading = true;
    this.claimsService.generateBatchReport(Array.from(this.selectedClaims))
      .subscribe({
        next: (blob:any) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'batch-report.pdf';
          link.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
        },
        error: (error:any) => {
          console.error('Error generating batch report:', error);
          this.loading = false;
        }
      });
  }

  generateReport(claimId: number): void {
    this.loading = true;
    this.claimsService.generateReport(claimId)
      .subscribe({
        next: (blob:any) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `claim-${claimId}-report.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
        },
        error: (error:any) => {
          console.error('Error generating report:', error);
          this.loading = false;
        }
      });
  }

  deleteClaim(claimId: number): void {
    if (confirm('Are you sure you want to delete this claim?')) {
      this.loading = true;
      this.claimsService.deleteClaim(claimId)
        .subscribe({
          next: () => {
            this.loadClaims();
          },
          error: (error) => {
            console.error('Error deleting claim:', error);
            this.loading = false;
          }
        });
    }
  }

  // Existing methods...
  ngOnInit(): void {
    this.loadClaims();
    this.setupFilterSubscription();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      status: [''],
      paymentStatus: [''],
      amountRange: this.fb.group({
        min: [''],
        max: ['']
      })
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadClaims();
      });
  }

  loadClaims(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.claimsService.getClaims(params).subscribe({
      next: (response) => {
        this.claims = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.loading = false;
      }
    });
  }
}