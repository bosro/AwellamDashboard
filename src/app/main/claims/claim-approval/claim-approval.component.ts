
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsService } from '../../../services/claim.service';
import { forkJoin } from 'rxjs';
import { Claim, ClaimStatus } from '../../../shared/types/claim-types';

interface ApprovalFormData {
  approverName: string;
  action: 'approve' | 'reject';
  notes: string;
}

type ApprovalForm = FormGroup<{
  approverName: FormControl<string>;
  action: FormControl<'approve' | 'reject'>;
  notes: FormControl<string>;
}>;

@Component({
  selector: 'app-claim-approval',
  templateUrl: './claim-approval.component.html'
})
export class ClaimApprovalComponent implements OnInit {
  approvalForm!: ApprovalForm;
  loading = false;
  selectedClaims: Claim[] = [];

  private readonly statusClasses: Record<ClaimStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  constructor(
    private fb: FormBuilder,
    private claimsService: ClaimsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const claimIds = this.route.snapshot.queryParams['claims']?.split(',');
    if (claimIds?.length) {
      this.loadClaims(claimIds);
    }
  }

  private createForm(): void {
    const form = this.fb.nonNullable.group({
      approverName: ['', Validators.required],
      action: ['approve' as 'approve' | 'reject', Validators.required],
      notes: ['', Validators.required]
    });

    this.approvalForm = form as ApprovalForm;
  }

  private loadClaims(claimIds: string[]): void {
    this.loading = true;
    const requests = claimIds.map(id => 
      this.claimsService.getClaimById(parseInt(id, 10))
    );

    forkJoin(requests).subscribe({
      next: (claims) => {
        this.selectedClaims = claims;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.loading = false;
      }
    });
  }

  getTotalAmount(): number {
    return this.selectedClaims.reduce((sum, claim) => sum + claim.totalAmount, 0);
  }

  onSubmit(): void {
    if (this.approvalForm.valid) {
      this.loading = true;
      const formValue = this.approvalForm.getRawValue();
      const { approverName, action, notes } = formValue;

      const updateRequests = this.selectedClaims.map(claim => 
        this.claimsService.updateClaim(claim.id, {
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedBy: approverName,
          approvalDate: new Date().toISOString(),
          notes: claim.notes 
            ? `${claim.notes}\n${action.toUpperCase()}: ${notes}`
            : `${action.toUpperCase()}: ${notes}`
        })
      );

      forkJoin(updateRequests).subscribe({
        next: () => {
          this.router.navigate(['/claims']);
        },
        error: (error) => {
          console.error('Error processing approval:', error);
          this.loading = false;
        }
      });
    }
  }

  getStatusClass(status: ClaimStatus): string {
    return this.statusClasses[status] || '';
  }
}