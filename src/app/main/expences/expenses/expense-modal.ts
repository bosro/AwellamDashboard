import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.html',
//   styleUrls: ['./expense-modal.component.scss']
})
export class ExpenseModalComponent implements OnInit {
  @Input() expense: any = null;
  @Input() trucks: any[] = [];
  @Input() expenseTypes: any[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  accountTypes = ['transport', 'maintenance', 'other'];
  statuses = ['pending', 'approved', 'rejected'];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    // Convert nested objects to their IDs for the form
    const truckId = this.expense?.truckId?._id || this.expense?.truckId || '';
    const expenseTypeId = this.expense?.expenseType?._id || this.expense?.expenseType || '';

    this.form = this.fb.group({
      truckId: [truckId, Validators.required],
      expenseType: [expenseTypeId, Validators.required],
      accountType: [this.expense?.accountType || 'transport', Validators.required],
      amount: [this.expense?.amount || '', [Validators.required, Validators.min(0)]],
      date: [this.formatDateForInput(this.expense?.date) || this.formatDateForInput(new Date()), Validators.required],
      recipient: [this.expense?.recipient || '', Validators.required],
      description: [this.expense?.description || '', Validators.required],
      status: [this.expense?.status || 'pending', Validators.required]
    });
  }

  formatDateForInput(dateStr: string | Date): string {
    if (!dateStr) return '';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toISOString().substring(0, 10);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = {
        ...this.form.value,
        date: new Date(this.form.value.date).toISOString()
      };
      
      // If we're editing, include the _id
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
}