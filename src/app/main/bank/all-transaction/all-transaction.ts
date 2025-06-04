// transactions.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transactions',
  templateUrl: './all-transaction.html',
})
export class TransactionComponent implements OnInit {
  transactions: any[] = [];
  bankId: string = '';
  startDate: string = '';
  endDate: string = '';

  private apiUrl = `${environment.apiUrl}/bank-statement`;
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.bankId = this.route.snapshot.paramMap.get('bankId') || '';

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    this.startDate = lastWeek.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

    this.fetchTransactions();
  }

  fetchTransactions() {
    const params = new HttpParams()
      .set('startDate', this.startDate)
      .set('endDate', this.endDate);

    this.http
      .get<any>(`${this.apiUrl}/transactions/bank/${this.bankId}`, { params })
      .subscribe({
        next: (res) => (this.transactions = res.data),
        error: (err) => console.error(err),
      });
  }

  onFilter() {
    this.fetchTransactions();
  }
}
