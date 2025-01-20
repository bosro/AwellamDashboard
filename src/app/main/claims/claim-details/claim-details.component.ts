import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsService, Claim } from '../../../services/claim.service'



// Define specific types for status
type ClaimStatus = 'pending' | 'processing' | 'approved' | 'rejected';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';

interface Timeline {
  title: string;
  description: string;
  timestamp?: string;  // Made optional since some dates might not exist
  icon: string;
}
@Component({
  selector: 'app-claim-details',
  templateUrl: './claim-details.component.html',
  styleUrls: ['./claim-details.component.scss']
})
export class ClaimDetailsComponent implements OnInit {
  claim!: Claim;
  loading = false;
  timeline: Timeline[] = [];

  constructor(
    private claimsService: ClaimsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadClaimDetails(id);
  }

  loadClaimDetails(id: number): void {
    this.loading = true;
    this.claimsService.getClaimById(id).subscribe({
      next: (data) => {
        this.claim = data;
        this.generateTimeline();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claim details:', error);
        this.loading = false;
      }
    });
  }

  generateTimeline(): void {
    this.timeline = [
      {
        title: 'Claim Created',
        description: 'Claim has been submitted for processing',
        timestamp: this.claim.date,
        icon: 'ri-file-list-3-line'
      },
      {
        title: 'Processing',
        description: this.claim.status === 'processing' ? 
          'Claim is being reviewed' : 'Awaiting processing',
        timestamp: this.claim.processingDate,
        icon: 'ri-time-line'
      },
      {
        title: this.claim.status === 'approved' ? 'Approved' : 'Approval Pending',
        description: this.claim.status === 'approved' ? 
          `Approved by ${this.claim.approvedBy}` : 'Awaiting approval',
        timestamp: this.claim.approvalDate,
        icon: 'ri-check-double-line'
      },
      {
        title: this.claim.paymentStatus === 'paid' ? 'Payment Complete' : 'Payment Pending',
        description: this.getPaymentDescription(),
        timestamp: this.claim.paymentDate,
        icon: 'ri-money-pound-circle-line'
      }
    ];
  }



  getPaymentDescription(): string {
    switch(this.claim.paymentStatus) {
      case 'paid':
        return `Payment completed on ${this.claim.paymentDate}`;
      case 'partial':
        return 'Partial payment received';
      default:
        return 'Awaiting payment';
    }
  }

  updateStatus(status: ClaimStatus): void {
    this.claimsService.updateClaim(
      this.claim.id,
      { status }
    ).subscribe({
      next: (updated) => {
        this.claim = updated;
        this.generateTimeline();
      }
    });
  }


  downloadAttachment(attachment: string): void {
    // Implement attachment download logic
  }

  generateReport(): void {
    this.claimsService.generateClaimReport(this.claim.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claim-${this.claim.claimNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  getStatusClass(status: ClaimStatus): string {
    const classes: Record<ClaimStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return classes[status];
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    const classes: Record<PaymentStatus, string> = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800'
    };
    return classes[status];
  }


}