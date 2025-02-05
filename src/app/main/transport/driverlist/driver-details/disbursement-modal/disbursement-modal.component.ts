// disbursement-modal.component.ts
import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { InventoryItem } from '../../../../../shared/types/inventory-types';

@Component({
  selector: 'app-disbursement-modal',
  templateUrl: './disbursement-modal.component.html'
})
export class DisbursementModalComponent implements OnChanges {
  @Input() show = false;
  @Input() item: InventoryItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  disbursementForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  private createForm(): void {
    this.disbursementForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      truckId: [''],
      requestedBy: ['', Validators.required]
    });
  }

  // Helper methods for template
  getFormControl(name: string): AbstractControl | null {
    return this.disbursementForm.get(name);
  }

  isFieldInvalid(name: string): boolean {
    const control = this.getFormControl(name);
    return !!control && control.invalid && control.touched;
  }

  hasError(name: string, errorType: string): boolean {
    const control = this.getFormControl(name);
    return !!control && control.touched && !!control.errors?.[errorType];
  }

  getMaxQuantity(): number {
    return this.item?.quantity ?? 0;
  }

  ngOnChanges(): void {
    if (this.item) {
      const quantityControl = this.disbursementForm.get('quantity');
      if (quantityControl) {
        quantityControl.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(this.getMaxQuantity())
        ]);
        quantityControl.updateValueAndValidity();
      }
    }
  }

  onClose(): void {
    this.disbursementForm.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.disbursementForm.valid) {
      this.submit.emit(this.disbursementForm.value);
      this.disbursementForm.reset();
    }
  }
}