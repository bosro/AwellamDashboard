import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BankService } from '../../../services/bank.service';

@Component({
  selector: 'app-bank-detail',
  templateUrl: './bank-detial.component.html'
})
export class BankDetailComponent implements OnInit {
  bankId: string = '';
  bank: any;
  transactions: any[] = [];
  selectedFile: File | null = null;
  selectedTransaction: any;
  showModal = false;
  customerId = '';
  uploadProgress: number | null = null;
  uploadMessage: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private bankService: BankService
  ) {}

  ngOnInit(): void {
    this.bankId = this.route.snapshot.paramMap.get('id') || '';
    this.loadBank();
    this.loadTransactions();
  }

  loadBank() {
    this.bankService.getBank(this.bankId).subscribe({
      next: (bank) => this.bank = bank,
      error: (err) => console.error('Failed to load bank:', err)
    });
  }

  loadTransactions() {
    this.bankService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data.filter((t: any) => t.bank?._id === this.bankId);
      },
      error: (err) => console.error('Failed to load transactions:', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (validTypes.includes(file.type)) {
        this.selectedFile = file;
        this.uploadMessage = `Selected: ${file.name}`;
      } else {
        this.uploadMessage = 'Invalid file type. Please upload a CSV or Excel file.';
      }
    }
  }

  upload() {
    if (!this.selectedFile) {
      this.uploadMessage = 'Please select a file first.';
      return;
    }

    this.uploadProgress = 0;
    this.uploadMessage = 'Uploading...';

    this.bankService.uploadCSV(this.bankId, this.selectedFile).subscribe({
      next: (event) => {
        if (event.status === 'progress') {
          this.uploadProgress = event.progress;
        } else if (event.status === 'complete') {
          this.uploadMessage = 'Upload successful!';
          this.uploadProgress = null;
          this.selectedFile = null;
          this.loadTransactions();
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        }
      },
      error: (err) => {
        this.uploadMessage = err;
        this.uploadProgress = null;
      }
    });
  }

  openReconcileModal(txn: any) {
    this.selectedTransaction = txn;
    this.customerId = '';
    this.showModal = true;
  }

  reconcile() {
    if (!this.customerId) {
      alert('Please enter a customer ID');
      return;
    }

    this.bankService.reconcile(
      this.selectedTransaction._id, 
      this.customerId
    ).subscribe({
      next: () => {
        this.loadTransactions();
        this.showModal = false;
      },
      error: (err) => {
        console.error('Reconciliation failed:', err);
        alert('Reconciliation failed. Please check the customer ID.');
      }
    });
  }
}