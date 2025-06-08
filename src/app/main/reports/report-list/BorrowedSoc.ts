import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaymentReference, SocNumber as BaseSocNumber } from '../../../services/payment.service';

interface SocNumber extends BaseSocNumber {
  paymentDetails?: {
    paymentRef: string;
    plantName: string;
    productName: string;
    socNumber: string;
    status: string;
    paidAt?: Date;
  };
}
import { PaymentService } from '../../../services/payment.service';
import { AnimationKeyframesSequenceMetadata } from '@angular/animations';

@Component({
  selector: 'app-payment-reference-socs',
  templateUrl: './BorrowedSoc.html'
})
export class PaymentReferenceSocsComponent implements OnInit {
  paymentReferenceId: string = '';
  paymentReference: PaymentReference | null = null;
  borrowedSocs: SocNumber[] = [];
  filteredSocs: SocNumber[] = [];
  socNumberFilter = new FormControl('');
  
  // Pagination properties
  itemsPerPage = 5;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  
  Math = Math;
  loading = false;
  error = '';
  
  // Modal properties
  showPayLoadModal = false;
  showPaymentDetailsModal = false;
  selectedSoc: any | null = null;
  paymentRef: string = '';
  productName: string = '';
  inputSocNumber: string = '';
  inputPlantName: string = '';

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.paymentReferenceId = params['id'];
      this.fetchPaymentReference();
      this.fetchBorrowedSocsByPaymentRef();
    });
    
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

  fetchPaymentReference(): void {
    this.loading = true;
    this.paymentService.getPaymentReferenceDetails(this.paymentReferenceId)
      .subscribe({
        next: (response) => {
          this.paymentReference = response.paymentReference;
  
          // Sync the status of SOCs with paymentDetails.status if available
          if (this.paymentReference?.socNumbers) {
            this.paymentReference.socNumbers.forEach((soc: any) => {
              if (soc.paymentDetails?.status?.toLowerCase() === 'paid') {
                soc.status = 'paid'; // Sync the main status with paymentDetails.status
              }
            });
          }
  
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load payment reference details. Please try again later.';
          console.error('Error fetching payment reference:', err);
          this.loading = false;
        }
      });
  }

  fetchBorrowedSocsByPaymentRef(): void {
    this.loading = true;
    this.paymentService.getPaymentReferenceDetails(this.paymentReferenceId)
      .subscribe({
        next: (response) => {
          this.borrowedSocs = response.paymentReference.socNumbers || [];
          
          // Process each SOC to ensure consistency between paymentDetails.status and SOC status
          this.borrowedSocs.forEach((soc:any) => {
            if (soc.paymentDetails && soc.paymentDetails.status === 'Paid') {
              soc.status = 'Paid'; // Ensure main status is synced
            }
          });
          
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

  get paginatedSocs(): any[] {
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
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Modal logic
  openPayLoadModal(soc: SocNumber): void {
    this.selectedSoc = soc;
    // Initialize with current values as suggestions
    this.inputSocNumber = soc.socNumber; 
    this.inputPlantName = soc.plantId.name;
    this.paymentRef = this.paymentReference?.paymentRef || '';
    this.productName = '';
    this.showPayLoadModal = true;
  }

  closePayLoadModal(): void {
    this.showPayLoadModal = false;
    this.selectedSoc = null;
    this.inputSocNumber = '';
    this.inputPlantName = '';
    this.paymentRef = '';
    this.productName = '';
  }

  submitPayLoad(): void {
    if (!this.inputSocNumber.trim()) {
      alert('Please enter a SOC number.');
      return;
    }
    
    if (!this.inputPlantName.trim()) {
      alert('Please enter a plant name.');
      return;
    }

    if (!this.paymentRef.trim()) {
      alert('Please enter a payment reference.');
      return;
    }

    if (!this.productName.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const payload = {
      socNumber: this.inputSocNumber,
      paymentRef: this.paymentRef,
      plantName: this.inputPlantName,
      productName: this.productName,
      status: 'paid' // Ensure the status is set to Paid
    };

    this.loading = true; // Show loading state while request is processing

    // Use the selected SOC's ID for the API call
    this.paymentService.paySoc(this.selectedSoc!._id, payload)
      .subscribe({
        next: (response) => {
          // Update the local SOC object with payment details and correct status
          const index = this.borrowedSocs.findIndex(soc => soc._id === this.selectedSoc!._id);
          if (index !== -1) {
            // Update both the main status and the payment details status
            this.borrowedSocs[index].status = 'paid';
            this.borrowedSocs[index].paymentDetails = {
              paymentRef: this.paymentRef,
              plantName: this.inputPlantName,
              productName: this.productName,
              socNumber: this.inputSocNumber,
              status: 'paid', // Ensure the status is set in payment details too
              paidAt: new Date()
            };
            
            // Update filtered list to reflect changes
            this.filteredSocs = [...this.borrowedSocs];
            this.updatePagination();
          }
          
          this.loading = false;
          alert('Payment successful and status updated to Paid.');
          this.closePayLoadModal();
          
          // Refresh data from server to ensure everything is in sync
          this.fetchBorrowedSocsByPaymentRef();
        },
        error: (err) => {
          console.error('Error updating status:', err);
          alert('Failed to update status. Please try again.');
          this.loading = false;
        }
      });
  }

  // View payment details modal
  openPaymentDetailsModal(soc: SocNumber): void {
    this.selectedSoc = soc;
    this.showPaymentDetailsModal = true;
  }

  closePaymentDetailsModal(): void {
    this.showPaymentDetailsModal = false;
    this.selectedSoc = null;
  }

  // Check if SOC has payment details
  hasPaymentDetails(soc: any): boolean {
    return soc.status?.toLowerCase() === 'paid' || 
         (soc.paymentDetails?.status?.toLowerCase() === 'paid');
  }
}