// transaction-detail-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Transaction } from '../../../../types';

@Component({
  selector: 'app-transaction-detail-modal',
  templateUrl: './transaction.details.html',
//   styleUrls: ['./transaction-detail-modal.component.css']
})
export class TransactionDetailModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction }) {}
}