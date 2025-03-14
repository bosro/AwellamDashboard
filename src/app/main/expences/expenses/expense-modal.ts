import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImprestService } from '../../../services/imprest.service';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.html',
})
export class ExpenseModalComponent implements OnInit {
  @Input() expense: any = null;
  @Input() trucks: any[] = [];
  @Input() expenseTypes: any[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  accountTypes = ['transport', "wholesale"];
  statuses = ['pending', 'approved', 'rejected'];
  imprests: any[] = [];
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private imprestService: ImprestService
  ) { }

  ngOnInit(): void {
    this.loadImprests();
    this.createForm();
    
    // Add listener for truck selection changes
    this.form.get('truckId')?.valueChanges.subscribe(truckId => {
      this.updateAccountTypeBasedOnTruck(truckId);
    });
    
    // Initialize account type based on initial truck selection
    this.updateAccountTypeBasedOnTruck(this.form.get('truckId')?.value);
  }

  updateAccountTypeBasedOnTruck(truckId: string): void {
    if (truckId) {
      // If truck is selected, set to transport and disable
      this.form.get('accountType')?.setValue('transport');
      this.form.get('accountType')?.disable();
    } else {
      // If no truck is selected, set to wholesale and enable
      this.form.get('accountType')?.setValue('wholesale');
      this.form.get('accountType')?.enable();
    }
  }

  loadImprests(): void {
    this.loading = true;
    this.imprestService.getAllImprests().subscribe({
      next: (response) => {
        if (response.success) {
          this.imprests = response.data;
        } else {
          this.error = 'Failed to load imprests';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading imprests: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  createForm(): void {
    // Convert nested objects to their IDs for the form
    const expenseTypeId = this.expense?.expenseType?._id || this.expense?.expenseType || '';
    const imprestId = this.expense?.imprestId?._id || this.expense?.imprestId || '';
    const truckId = this.expense?.truckId?._id || this.expense?.truckId || '';

    const formGroup: any = {
      expenseType: [expenseTypeId, Validators.required],
      imprestId: [imprestId],
      truckId: [truckId], // Always include truckId control initially
      accountType: [this.expense?.accountType || 'transport', Validators.required],
      amount: [this.expense?.amount || '', [Validators.required, Validators.min(0)]],
      date: [this.formatDateForInput(this.expense?.date) || this.formatDateForInput(new Date()), Validators.required],
      recipient: [this.expense?.recipient || '', Validators.required],
      description: [this.expense?.description || '', Validators.required],
      status: [this.expense?.status || 'pending', Validators.required]
    };

    this.form = this.fb.group(formGroup);
  }

  formatDateForInput(dateStr: string | Date): string {
    if (!dateStr) return '';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toISOString().substring(0, 10);
  }
    
  onSubmit(): void {
    if (this.form.valid) {
      // Use getRawValue to include disabled controls
      const formData = {
        ...this.form.getRawValue(),
        date: new Date(this.form.getRawValue().date).toISOString()
      };
      
      // Remove truckId from payload if it's empty/null
      if (!formData.truckId) {
        delete formData.truckId;
      }
      
      if (this.expense && this.expense._id) {
        formData._id = this.expense._id;
      }
      
      this.save.emit(formData);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Format the imprest display name
  formatImprestName(imprest: any): string {
    if (!imprest) return 'Unknown';
    const balance = imprest.currentBalance ? ` (Balance: ${this.formatCurrency(imprest.currentBalance)})` : '';
    return `${imprest.description}${balance}`;
  }

  formatCurrency(amount: number): string {
    return amount?.toLocaleString('en-US', { style: 'currency', currency: 'GHC' }) || '$0.00';
  }
}