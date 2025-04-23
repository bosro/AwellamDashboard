// components/banks/banks.component.ts
import { Component, OnInit } from '@angular/core';
import { BankService, Bank } from '../../../services/bank.service';

@Component({
  selector: 'app-banks',
  templateUrl: './bank-list.component.html',
//   styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {
  banks: Bank[] = [];
  loading = false;
  error = '';
  showAddModal = false;

  constructor(private bankService: BankService) { }

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(): void {
    this.loading = true;
    this.bankService.getAllBanks().subscribe({
      next: (data) => {
        this.banks = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load banks: ' + err.message;
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onBankAdded(bank: Bank): void {
    this.banks.push(bank);
    this.closeAddModal();
  }

  deleteBank(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this bank?')) {
      this.bankService.deleteBank(id).subscribe({
        next: () => {
          this.banks = this.banks.filter(bank => bank._id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete bank: ' + err.message;
        }
      });
    }
  }
}