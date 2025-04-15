import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-borrowed-soc',
  templateUrl: './BorrowedSoc.html'
})
export class BorrowedSocComponent implements OnInit {
  borrowedSocs: any[] = [];
  filteredSocs: any[] = [];
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
  selectedSoc: any = null;
  // paymentFee: number | null = null;
  paymentRef: string = '';
  productName: string = '';
  inputSocNumber: string = '';
  inputPlantName: string = '';

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
    this.http.get(`${environment.apiUrl}/soc/getsoc/isborrowed`)
      .subscribe({
        next: (response: any) => {
          this.borrowedSocs = response.borrowedSocs;
          
          // Process each SOC to ensure consistency between paymentDetails.status and SOC status
          this.borrowedSocs.forEach(soc => {
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
  openPayLoadModal(soc: any): void {
    this.selectedSoc = soc;
    // Initialize with current values as suggestions
    this.inputSocNumber = soc.socNumber; 
    this.inputPlantName = soc.plantId.name;
    // this.paymentFee = null;
    this.paymentRef = '';
    this.productName = '';
    this.showPayLoadModal = true;
  }

  closePayLoadModal(): void {
    this.showPayLoadModal = false;
    this.selectedSoc = null;
    this.inputSocNumber = '';
    this.inputPlantName = '';
    // this.paymentFee = null;
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
    
    // if (!this.paymentFee || this.paymentFee <= 0) {
    //   alert('Please enter a valid payment fee.');
    //   return;
    // }

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
      // paymentFee: this.paymentFee,
      paymentRef: this.paymentRef,
      plantName: this.inputPlantName,
      productName: this.productName,
      status: 'paid' // Ensure the status is set to Paid
    };

    this.loading = true; // Show loading state while request is processing

    // Use the selected SOC's ID for the API call, but use the manually entered values for the payload
    this.http.put(`${environment.apiUrl}/soc/paySoc/${this.selectedSoc._id}`, payload)
      .subscribe({
        next: (response: any) => {
          // Update the local SOC object with payment details and correct status
          const index = this.borrowedSocs.findIndex(soc => soc._id === this.selectedSoc._id);
          if (index !== -1) {
            // Update both the main status and the payment details status
            this.borrowedSocs[index].status = 'paid';
            this.borrowedSocs[index].paymentDetails = {
              // paymentFee: this.paymentFee,
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
          this.fetchBorrowedSocs();
        },
        error: (err) => {
          console.error('Error updating status:', err);
          alert('Failed to update status. Please try again.');
          this.loading = false;
        }
      });
  }

  // View payment details modal
  openPaymentDetailsModal(soc: any): void {
    this.selectedSoc = soc;
    this.showPaymentDetailsModal = true;
  }

  closePaymentDetailsModal(): void {
    this.showPaymentDetailsModal = false;
    this.selectedSoc = null;
  }

  // Check if SOC has payment details
  hasPaymentDetails(soc: any): boolean {
    return soc.status.toLowerCase() === 'paid' || 
           (soc.paymentDetails && soc.paymentDetails.status && 
            soc.paymentDetails.status.toLowerCase() === 'paid');
  }
}