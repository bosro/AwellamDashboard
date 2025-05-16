import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderTypeService } from '../../../services/order-type.service';

@Component({
  selector: 'app-order-type-list',
  templateUrl: './order-type-list.component.html',
})
export class OrderTypeListComponent implements OnInit {
  orderTypes: any[] = [];
  error: string = '';
  showModal: boolean = false; // Controls modal visibility
  orderTypeForm: FormGroup; // Form for creating/editing
  isEditMode: boolean = false; // Tracks whether the modal is in edit mode
  selectedOrderType: any = null; // Holds the selected order type for editing

  constructor(private orderTypeService: OrderTypeService, private fb: FormBuilder) {
    this.orderTypeForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadOrderTypes();
  }

  loadOrderTypes(): void {
    this.orderTypeService.getAllOrderTypes().subscribe({
      next: (response) => {
        this.orderTypes = response.data;
      },
      error: (err) => {
        this.error = 'Failed to load order types.';
        console.error(err);
      },
    });
  }

  openModal(orderType?: any): void {
    this.showModal = true;
    this.isEditMode = !!orderType; // If `orderType` is provided, it's edit mode
    this.selectedOrderType = orderType || null;

    if (orderType) {
      // Populate the form with the selected order type's data
      this.orderTypeForm.patchValue(orderType);
    } else {
      // Reset the form for creating a new order type
      this.orderTypeForm.reset();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOrderType = null;
    this.orderTypeForm.reset();
  }

  saveOrderType(): void {
    if (this.orderTypeForm.invalid) return;

    const formData = this.orderTypeForm.value;

    if (this.isEditMode && this.selectedOrderType) {
      // Update existing order type
      this.orderTypeService.updateOrderType(this.selectedOrderType._id, formData).subscribe({
        next: () => {
          this.loadOrderTypes();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to update order type.';
          console.error(err);
        },
      });
    } else {
      // Create new order type
      this.orderTypeService.createOrderType(formData).subscribe({
        next: () => {
          this.loadOrderTypes();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to create order type.';
          console.error(err);
        },
      });
    }
  }

  deleteOrderType(id: string): void {
    if (confirm('Are you sure you want to delete this order type?')) {
      this.orderTypeService.deleteOrderType(id).subscribe({
        next: () => {
          this.loadOrderTypes();
        },
        error: (err) => {
          this.error = 'Failed to delete order type.';
          console.error(err);
        },
      });
    }
  }
}