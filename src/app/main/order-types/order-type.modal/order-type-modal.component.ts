import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderTypeService } from '../../../services/order-type.service';

@Component({
  selector: 'app-order-type-modal',
  templateUrl: './order-type-modal.component.html',
})
export class OrderTypeModalComponent {
  @Input() orderType: any;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  orderTypeForm: FormGroup;
  isEdit: boolean = false;

  constructor(private fb: FormBuilder, private orderTypeService: OrderTypeService) {
    this.orderTypeForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnChanges(): void {
    if (this.orderType) {
      this.isEdit = true;
      this.orderTypeForm.patchValue(this.orderType);
    } else {
      this.isEdit = false;
      this.orderTypeForm.reset();
    }
  }

  saveOrderType(): void {
    const data = this.orderTypeForm.value;

    if (this.isEdit) {
      this.orderTypeService.updateOrderType(this.orderType._id, data).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal();
        },
        error: (err) => console.error(err),
      });
    } else {
      this.orderTypeService.createOrderType(data).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal();
        },
        error: (err) => console.error(err),
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}