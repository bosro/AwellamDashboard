// components/transactions/transactions.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BankStatementService, BankTransaction } from '../../../services/bank-statement.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transaction.component.html',
//   styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  bankId: string = '';
  uploadId: string = '';
  transactions: BankTransaction[] = [];
  loading = false;
  error = '';
  showReconcileModal = false;
  selectedTransaction?: BankTransaction;

  constructor(
    private route: ActivatedRoute,
    private bankStatementService: BankStatementService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bankId = params['bankId'];
      this.uploadId = params['uploadId'];
      this.loadTransactions();
    });
  }

  loadTransactions(): void {
    this.loading = true;
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

  onTransactionReconciled(transaction: BankTransaction): void {
    const index = this.transactions.findIndex(t => t._id === transaction._id);
    if (index !== -1) {
      this.transactions[index] = transaction;
    }
    this.closeReconcileModal();
  }
}