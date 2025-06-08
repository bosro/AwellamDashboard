// transport-income.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateTransportIncomeRequest, TransportIncome, TransportIncomeService } from '../../../services/transportIncome.service';
import { TruckService } from '../../../services/truck.service';
import { Truck } from '../../../shared/types/fuel.interface';

@Component({
  selector: 'app-transport-income',
  templateUrl: './transapoertIncome.html',
  // styleUrls: ['./transportIncome.component.css']
})
export class TransportIncomeComponent implements OnInit {
  activeTab = 'create';
  transportIncomes: any[] = [];
  receipts: any[] = [];
  selectedFile: File | null = null;
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  trucks: any[] = [];

  // Forms
  createForm: FormGroup;
  editForm: FormGroup;
  receiptForm: FormGroup;

  // Edit mode
  editingIncome: any | null = null;

  constructor(
    private fb: FormBuilder,
    private transportService: TransportIncomeService,
    private truckService: TruckService,
  ) {
    this.createForm = this.fb.group({
      customer: ['', [Validators.required]],
      truck: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]]
    });

    this.editForm = this.fb.group({
      customer: ['', [Validators.required]],
      truck: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]]
    });

    this.receiptForm = this.fb.group({
      transportIncomeId: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      submittedBy: ['']
    });
  }

  ngOnInit() {
    this.loadTransportIncomes();
    this.loadReceipts();
    this.loadTrucks();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.clearMessage();
  }

  // Load all transport incomes
  loadTransportIncomes() {
    this.loading = true;
    this.transportService.getAllTransportIncomes().subscribe({
      next: (data) => {
        this.transportIncomes = data;
        this.loading = false;
      },
      error: (error) => {
        this.showMessage('Error loading transport incomes', 'error');
        this.loading = false;
      }
    });
  }

  // Load all receipts
  loadReceipts() {
    this.transportService.getAllReceipts().subscribe({
      next: (response) => {
        this.receipts = response.data || [];
      },
      error: (error) => {
        this.showMessage('Error loading receipts', 'error');
      }
    });
  }

  // Create transport income
  onCreateSubmit() {
    if (this.createForm.valid) {
      this.loading = true;
      const formData: CreateTransportIncomeRequest = this.createForm.value;
      
      this.transportService.createTransportIncome(formData).subscribe({
        next: (response) => {
          this.showMessage('Transport income created successfully', 'success');
          this.createForm.reset();
          this.loadTransportIncomes();
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error creating transport income', 'error');
          this.loading = false;
        }
      });
    }
  }

  loadTrucks(): void {
    this.loading = true;
    this.truckService.getTrucks().subscribe({
      next: (response) => {
        this.trucks = response.trucks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      }
    });
  }

  // Start editing
  startEdit(income: TransportIncome) {
    this.editingIncome = income;
    this.editForm.patchValue({
      customer: income.customer,
      truck: income.truck,
      amount: income.amount
    });
    this.setActiveTab('edit');
  }

  // Update transport income
  onEditSubmit() {
    if (this.editForm.valid && this.editingIncome) {
      this.loading = true;
      const formData = this.editForm.value;
      
      this.transportService.updateTransportIncome(this.editingIncome._id!, formData).subscribe({
        next: (response) => {
          this.showMessage('Transport income updated successfully', 'success');
          this.editForm.reset();
          this.editingIncome = null;
          this.loadTransportIncomes();
          this.setActiveTab('list');
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error updating transport income', 'error');
          this.loading = false;
        }
      });
    }
  }

  // Cancel edit
  cancelEdit() {
    this.editingIncome = null;
    this.editForm.reset();
    this.setActiveTab('list');
  }

  // Delete transport income
  deleteIncome(id: string) {
    if (confirm('Are you sure you want to delete this transport income?')) {
      this.loading = true;
      this.transportService.deleteTransportIncome(id).subscribe({
        next: (response) => {
          this.showMessage('Transport income deleted successfully', 'success');
          this.loadTransportIncomes();
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error deleting transport income', 'error');
          this.loading = false;
        }
      });
    }
  }

  // NEW METHOD: Update receipt amount
  updateReceiptAmount(id: string) {
    const newAmount = prompt('Enter new receipt amount:');
    if (newAmount && !isNaN(Number(newAmount))) {
      this.loading = true;
      this.transportService.updateReceiptAmount(id, Number(newAmount)).subscribe({
        next: (response) => {
          this.showMessage('Receipt amount updated successfully', 'success');
          this.loadTransportIncomes();
          this.loadReceipts();
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error updating receipt amount', 'error');
          this.loading = false;
        }
      });
    }
  }

  // NEW METHOD: Delete receipt entry
  deleteReceiptEntry(id: string) {
    if (confirm('Are you sure you want to delete this receipt?')) {
      this.loading = true;
      this.transportService.deleteReceiptEntry(id).subscribe({
        next: (response) => {
          this.showMessage('Receipt deleted successfully', 'success');
          this.loadReceipts();
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error deleting receipt', 'error');
          this.loading = false;
        }
      });
    }
  }

  // NEW METHOD: View receipt file using service
  viewReceiptFile(filename: string) {
    this.transportService.viewReceiptFile(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.showMessage('Error viewing receipt file', 'error');
      }
    });
  }

  // File selection
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Upload receipt
  onReceiptSubmit() {
    if (this.receiptForm.valid && this.selectedFile) {
      this.loading = true;
      const formData = this.receiptForm.value;
      
      this.transportService.uploadReceipt(
        formData.transportIncomeId,
        this.selectedFile,
        formData.amount,
        formData.submittedBy
      ).subscribe({
        next: (response) => {
          this.showMessage('Receipt uploaded successfully', 'success');
          this.receiptForm.reset();
          this.selectedFile = null;
          this.loadReceipts();
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error uploading receipt', 'error');
          this.loading = false;
        }
      });
    }
  }

  // Update receipt status
  updateReceiptStatus(transportIncomeId: string, receiptIndex: number, status: 'approved' | 'rejected') {
    this.transportService.updateReceiptStatus(transportIncomeId, receiptIndex, status).subscribe({
      next: (response) => {
        this.showMessage(`Receipt ${status} successfully`, 'success');
        this.loadReceipts();
      },
      error: (error) => {
        this.showMessage(`Error ${status === 'approved' ? 'approving' : 'rejecting'} receipt`, 'error');
      }
    });
  }

  // Utility methods
  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.clearMessage();
    }, 5000);
  }

  clearMessage() {
    this.message = '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
}