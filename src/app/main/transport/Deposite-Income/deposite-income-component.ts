import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepositService, DepositReceipt, ReceivingIncome, AccumulatedIncome } from '../../../services/deposite-income.service';
import { TruckService } from '../../../services/truck.service';

@Component({
  selector: 'app-deposit-management',
  templateUrl: './deposite-income-component.html',
})
export class DepositManagementComponent implements OnInit {
  activeTab = 'record-income';
  userRole = 'super-admin'; // This should come from your auth service
  loading = false;
  
  // Forms
  incomeForm: FormGroup;
  depositForm: FormGroup;
  adminSearchForm: FormGroup;
  editReceiptForm: FormGroup;
  editAccumulatedForm: FormGroup;
  
  // Data
  trucks: any[] = [];
  depositReceipts: DepositReceipt[] = [];
  accumulatedIncomes: AccumulatedIncome[] = [];
  selectedReceipt: DepositReceipt | null = null;
  selectedAccumulated: AccumulatedIncome | null = null;
  
  // Modal states
  previewModalOpen = false;
  editReceiptModalOpen = false;
  editAccumulatedModalOpen = false;
  deleteConfirmModalOpen = false;
  deleteItemType = ''; // 'receipt' or 'accumulated'
  deleteItemId = '';
  
  // Messages
  successMessage = '';
  errorMessage = '';
  
  // File handling
  selectedFile: File | null = null;
  imagePreview = '';

  constructor(
    private fb: FormBuilder,
    private depositService: DepositService,
    private truckService: TruckService
  ) {
    this.incomeForm = this.fb.group({
      customer: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      reference: ['', Validators.required],
      truckId: ['']
    });

    this.depositForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.adminSearchForm = this.fb.group({
      adminId: ['', Validators.required]
    });

    this.editReceiptForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      status: ['', Validators.required]
    });

    this.editAccumulatedForm = this.fb.group({
      totalAmount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadTrucks();
    if (this.userRole === 'super-admin') {
      this.loadAllDepositReceipts();
      this.loadAccumulatedIncome();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.clearMessages();
    
    if (tab === 'manage-receipts' && this.userRole === 'super-admin') {
      this.loadAllDepositReceipts();
    } else if (tab === 'accumulated-income' && this.userRole === 'super-admin') {
      this.loadAccumulatedIncome();
    }
  }

  // Load trucks for dropdown
  loadTrucks(): void {
    this.loading = true;
    this.truckService.getTrucks().subscribe({
      next: (response) => {
        this.trucks = response.trucks || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.errorMessage = 'Error loading trucks';
        this.loading = false;
      }
    });
  }

  // Record Income
  onSubmitIncome() {
    if (this.incomeForm.valid) {
      this.loading = true;
      this.depositService.recordIncome(this.incomeForm.value).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.incomeForm.reset();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error recording income';
          this.loading = false;
        }
      });
    }
  }

  // File handling for deposit receipt
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Upload Deposit Receipt
  onSubmitDeposit() {
    if (this.depositForm.valid && this.selectedFile) {
      this.loading = true;
      
      const formData = new FormData();
      formData.append('amount', this.depositForm.value.amount);
      formData.append('image', this.selectedFile);

      this.depositService.uploadDepositReceipt(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.depositForm.reset();
          this.selectedFile = null;
          this.imagePreview = '';
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error uploading deposit receipt';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields and select an image';
    }
  }

  // Load all deposit receipts (super admin)
  loadAllDepositReceipts() {
    this.loading = true;
    this.depositService.getAllDepositReceipts().subscribe({
      next: (response) => {
        this.depositReceipts = response.receipts;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error loading receipts';
        this.loading = false;
      }
    });
  }

  // Load accumulated income
  loadAccumulatedIncome() {
    this.loading = true;
    this.depositService.getAccumulatedIncome().subscribe({
      next: (response) => {
        this.accumulatedIncomes = response.accumulated;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'No accumulated income found for this admin';
        this.loading = false;
      }
    });
  }

  // Search receipts by admin
  searchReceiptsByAdmin() {
    if (this.adminSearchForm.valid) {
      this.loading = true;
      const adminId = this.adminSearchForm.value.adminId;
      
      this.depositService.getDepositReceiptsByAdmin(adminId).subscribe({
        next: (response) => {
          this.depositReceipts = response.receipts;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error loading receipts';
          this.loading = false;
        }
      });
    }
  }

  // Preview receipt
  previewReceipt(receipt: DepositReceipt) {
    this.selectedReceipt = receipt;
    this.previewModalOpen = true;
  }

  // Open edit receipt modal
  openEditReceiptModal(receipt: DepositReceipt) {
    this.selectedReceipt = receipt;
    this.editReceiptForm.patchValue({
      amount: receipt.amount,
      status: receipt.status
    });
    this.editReceiptModalOpen = true;
  }

  // Edit receipt
  onSubmitEditReceipt() {
    if (this.editReceiptForm.valid && this.selectedReceipt) {
      this.loading = true;
      this.depositService.editDepositReceipt(this.selectedReceipt._id!, this.editReceiptForm.value).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadAllDepositReceipts();
          this.editReceiptModalOpen = false;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error updating receipt';
          this.loading = false;
        }
      });
    }
  }

  // Open edit accumulated income modal
  openEditAccumulatedModal(accumulated: AccumulatedIncome) {
    this.selectedAccumulated = accumulated;
    this.editAccumulatedForm.patchValue({
      totalAmount: accumulated.totalAmount
    });
    this.editAccumulatedModalOpen = true;
  }

  // Edit accumulated income
  onSubmitEditAccumulated() {
    if (this.editAccumulatedForm.valid && this.selectedAccumulated) {
      this.loading = true;
      this.depositService.editAccumulatedIncome(this.selectedAccumulated._id!, this.editAccumulatedForm.value).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadAccumulatedIncome();
          this.editAccumulatedModalOpen = false;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error updating accumulated income';
          this.loading = false;
        }
      });
    }
  }

  // Open delete confirmation modal
  openDeleteConfirmModal(id: string, type: 'receipt' | 'accumulated') {
    this.deleteItemId = id;
    this.deleteItemType = type;
    this.deleteConfirmModalOpen = true;
  }

  // Confirm delete
  confirmDelete() {
    if (this.deleteItemType === 'receipt') {
      this.deleteReceipt(this.deleteItemId);
    } else if (this.deleteItemType === 'accumulated') {
      this.deleteAccumulated(this.deleteItemId);
    }
  }

  // Delete receipt
  deleteReceipt(id: string) {
    this.loading = true;
    this.depositService.deleteDepositReceipt(id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadAllDepositReceipts();
        this.deleteConfirmModalOpen = false;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error deleting receipt';
        this.loading = false;
      }
    });
  }

  // Delete accumulated income
  deleteAccumulated(id: string) {
    this.loading = true;
    this.depositService.deleteAccumulatedIncome(id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadAccumulatedIncome();
        this.deleteConfirmModalOpen = false;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error deleting accumulated income';
        this.loading = false;
      }
    });
  }

  // Approve/Reject receipt
  approveReceipt(id: string, status: 'approved' | 'rejected') {
    this.loading = true;
    this.depositService.approveDepositReceipt(id, status).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadAllDepositReceipts();
        this.previewModalOpen = false;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error updating receipt';
        this.loading = false;
      }
    });
  }

  // Close modals
  closePreview() {
    this.previewModalOpen = false;
    this.selectedReceipt = null;
  }

  closeEditReceiptModal() {
    this.editReceiptModalOpen = false;
    this.selectedReceipt = null;
  }

  closeEditAccumulatedModal() {
    this.editAccumulatedModalOpen = false;
    this.selectedAccumulated = null;
  }

  closeDeleteConfirmModal() {
    this.deleteConfirmModalOpen = false;
    this.deleteItemId = '';
    this.deleteItemType = '';
  }

  // Clear messages
  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Format date
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get truck name by ID
  getTruckName(truckId: string): string {
    const truck = this.trucks.find(t => t._id === truckId);
    return truck ? `${truck.truckNumber} - ${truck.plateNumber}` : 'Unknown Truck';
  }
}