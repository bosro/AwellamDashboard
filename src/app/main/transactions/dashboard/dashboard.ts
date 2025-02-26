import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { BankName, PaymentMethod, TransactionType } from '../../../../types';

interface BankTransaction {
  bank: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
  paymentCount: number;
  refundCount: number;
}

@Component({
  selector: 'app-bank-transactions-dashboard',
  templateUrl: './transactiondashboard.html',
//   styleUrls: ['./bank-transactions-dashboard.component.css']
})
export class BankTransactionsDashboardComponent implements OnInit {
  // Data collections
  bankTransactions: BankTransaction[] = [];
  transactions: any[] = [];
  
  // Timeframe filter
  timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month';
  
  // Statistics
  totalBankTransactions: number = 0;
  totalBankAmount: number = 0;
  
  // Loading state
  loading: boolean = false;
  
  // Enum values
  bankNames = Object.values(BankName);

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    switch (this.timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    // Format dates for API
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Create parameters for API
    const params = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      limit: 1000 // Get a large number to analyze
    };
    
    this.transactionService.getTransactions().subscribe(
      response => {
        if (response && response.data) {
          this.transactions = response.data;
          this.analyzeTransactionsByBank(response.data);
        } else {
          console.error('Invalid transaction response:', response);
          this.transactions = [];
          this.resetBankStats();
        }
        this.loading = false;
      },
      error => {
        console.error('Error loading transactions:', error);
        this.transactions = [];
        this.resetBankStats();
        this.loading = false;
      }
    );
  }

  analyzeTransactionsByBank(transactions: any[]): void {
    // Filter only bank transfer transactions
    const bankTransactions = transactions.filter(t => t.paymentMethod === PaymentMethod.BANK_TRANSFER);
    
    // Initialize bank stats with all available banks
    const bankStats: Record<string, BankTransaction> = {};
    
    // Initialize with all known banks
    this.bankNames.forEach(bank => {
      bankStats[bank] = {
        bank: bank,
        totalAmount: 0,
        count: 0,
        averageAmount: 0,
        paymentCount: 0,
        refundCount: 0
      };
    });
    
    // Add "Other" category for unknown banks
    bankStats['Other'] = {
      bank: 'Other',
      totalAmount: 0,
      count: 0,
      averageAmount: 0,
      paymentCount: 0,
      refundCount: 0
    };
    
    // Aggregate transaction data by bank
    bankTransactions.forEach(transaction => {
      const bankName = transaction.bankName || 'Other';
      
      // If bank is not in our predefined list, add to "Other"
      const bank = this.bankNames.includes(bankName) ? bankName : 'Other';
      
      bankStats[bank].count++;
      
      if (transaction.type === TransactionType.PAYMENT) {
        bankStats[bank].totalAmount += transaction.amount;
        bankStats[bank].paymentCount++;
      } else if (transaction.type === TransactionType.REFUND) {
        bankStats[bank].totalAmount -= transaction.amount;
        bankStats[bank].refundCount++;
      }
    });
    
    // Calculate averages and convert to array
    this.bankTransactions = Object.values(bankStats)
      .map(bank => {
        bank.averageAmount = bank.count > 0 ? bank.totalAmount / bank.count : 0;
        return bank;
      })
      .filter(bank => bank.count > 0) // Remove banks with no transactions
      .sort((a, b) => b.totalAmount - a.totalAmount); // Sort by total amount
    
    // Calculate totals
    this.totalBankTransactions = bankTransactions.length;
    this.totalBankAmount = bankTransactions.reduce((sum, t) => {
      if (t.type === TransactionType.PAYMENT) {
        return sum + t.amount;
      } else if (t.type === TransactionType.REFUND) {
        return sum - t.amount; 
      }
      return sum;
    }, 0);
  }

  resetBankStats(): void {
    this.bankTransactions = [];
    this.totalBankTransactions = 0;
    this.totalBankAmount = 0;
  }

  changeTimeframe(timeframe: 'week' | 'month' | 'quarter' | 'year'): void {
    this.timeframe = timeframe;
    this.loadTransactions();
  }

  getProgressBarWidth(amount: number): string {
    if (this.bankTransactions.length === 0) return '0%';
    
    const maxAmount = Math.max(...this.bankTransactions.map(b => b.totalAmount));
    const percentage = (amount / maxAmount) * 100;
    return `${percentage}%`;
  }

  getAmountColor(amount: number): string {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  }
}