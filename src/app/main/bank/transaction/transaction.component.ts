import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BankStatementService, BankTransaction } from '../../../services/bank-statement.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transaction.component.html',
})
export class TransactionsComponent implements OnInit {
  bankId: string = '';
  uploadId: string = '';
  fileName: string = '';
  transactions: BankTransaction[] = [];
  loading = false;
  error = '';
  showReconcileModal = false;
  showReferenceModal = false;
  selectedTransaction?: BankTransaction;

  constructor(
    private route: ActivatedRoute,
    private bankStatementService: BankStatementService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bankId = params['bankId'];
      this.uploadId = params['uploadId'];
      this.fileName = params['fileName'] || 'Unknown';
      this.loadTransactions();
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = '';
    
    this.bankStatementService.getTransactionsByUploadId(this.uploadId).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions: ' + err.message;
        this.loading = false;
      }
    });
  }

  deleteTransaction(transactionId: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.loading = true;
      this.bankStatementService.deleteTransaction(transactionId).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t._id !== transactionId);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete transaction: ' + err.message;
          this.loading = false;
        }
      });
    }
  }

  openReconcileModal(transaction: BankTransaction): void {
    if (!transaction.matched) {
      this.selectedTransaction = transaction;
      this.showReconcileModal = true;
    }
  }

  closeReconcileModal(): void {
    this.showReconcileModal = false;
    this.selectedTransaction = undefined;
  }

  openReferenceModal(transaction: BankTransaction): void {
    this.selectedTransaction = transaction;
    this.showReferenceModal = true;
  }

  closeReferenceModal(): void {
    this.showReferenceModal = false;
  }

  onTransactionReconciled(transaction: BankTransaction): void {
    const index = this.transactions.findIndex(t => t._id === transaction._id);
    if (index !== -1) {
      this.transactions[index] = transaction;
    }
    this.closeReconcileModal();
  }

  refreshTransactions(): void {
    this.loadTransactions();
  }
}