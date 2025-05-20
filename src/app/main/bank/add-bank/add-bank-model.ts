// components/add-bank-modal/add-bank-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankService, Bank } from '../../../services/bank.service';

@Component({
  selector: 'app-add-bank-modal',
  templateUrl: './add-bank-model.html',
//   styleUrls: ['./add-bank-modal.component.scss']
})
export class AddBankModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() bankAdded = new EventEmitter<Bank>();

  bankForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private bankService: BankService
  ) {
    this.bankForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.bankForm.invalid) {
      return;
    }

    this.loading = true;
    const name = this.bankForm.value.name;
    
    this.bankService.createBank(name).subscribe({
      next: (bank) => {
        this.loading = false;
        this.bankAdded.emit(bank);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to create bank';
      }
    });
  }
}