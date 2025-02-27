import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseTypeService, ExpenseType } from '../../../services/expenseType.service';

@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html'
})
export class ExpenseTypeComponent implements OnInit {
  // List properties
  expenseTypes: ExpenseType[] = [];
  selectedExpenseType: ExpenseType | null = null;
  isModalOpen = false;
  isLoading = false;
  error = '';
  
  // Form properties
  form!: FormGroup;
  categories = ['Transportation', 'Maintenance', 'Fuel', 'Food', 'Accommodation', 'Other'];

  constructor(
    private expenseTypeService: ExpenseTypeService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadExpenseTypes();
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  loadExpenseTypes(): void {
    this.isLoading = true;
    this.expenseTypeService.getAll().subscribe({
      next: (response) => {
        this.expenseTypes = response.expenseTypes || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load expense types';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  openCreateModal(): void {
    this.selectedExpenseType = null;
    this.form.reset({
      name: '',
      category: '',
      status: 'active'
    });
    this.isModalOpen = true;
  }

  openEditModal(expenseType: ExpenseType): void {
    this.selectedExpenseType = { ...expenseType };
    this.form.patchValue({
      name: expenseType.name,
      category: expenseType.category,
      status: expenseType.status
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedExpenseType = null;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      
      if (this.selectedExpenseType && this.selectedExpenseType._id) {
        this.expenseTypeService.update(this.selectedExpenseType._id, formData).subscribe({
          next: () => {
            this.loadExpenseTypes();
            this.closeModal();
          },
          error: (err) => {
            this.error = 'Failed to update expense type';
            console.error(err);
          }
        });
      } else {
        this.expenseTypeService.create(formData).subscribe({
          next: () => {
            this.loadExpenseTypes();
            this.closeModal();
          },
          error: (err) => {
            this.error = 'Failed to create expense type';
            console.error(err);
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.closeModal();
  }

  deleteExpenseType(id: string): void {
    if (confirm('Are you sure you want to delete this expense type?')) {
      this.expenseTypeService.delete(id).subscribe({
        next: () => {
          this.loadExpenseTypes();
        },
        error: (err) => {
          this.error = 'Failed to delete expense type';
          console.error(err);
        }
      });
    }
  }
}