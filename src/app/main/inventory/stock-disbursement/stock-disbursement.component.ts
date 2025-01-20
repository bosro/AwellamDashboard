// stock-disbursement.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';
import { Router } from '@angular/router';
import { InventoryItem, CreateStockDisbursement } from '../../../shared/types/inventory-types'

@Component({
  selector: 'app-stock-disbursement',
  templateUrl: './stock-disbursement.component.html'
})
export class StockDisbursementComponent implements OnInit {
  disbursementForm!: FormGroup;
  loading = false;
  inventoryItems: InventoryItem[] = [];
  selectedItem: InventoryItem | null = null;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadInventoryItems();
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

  getControlValue(name: string): any {
    return this.getFormControl(name)?.value;
  }

  private createForm(): void {
    this.disbursementForm = this.fb.group({
      inventoryItemId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      truckId: [''],
      requestedBy: ['', Validators.required],
      purpose: ['', Validators.required],
      disbursementDate: [new Date().toISOString().split('T')[0], Validators.required]
    });

    // Subscribe to inventory item changes to update max quantity
    const itemControl = this.getFormControl('inventoryItemId');
    if (itemControl) {
      itemControl.valueChanges.subscribe(itemId => {
        this.selectedItem = this.inventoryItems.find(item => item.id === Number(itemId)) || null;
        const quantityControl = this.getFormControl('quantity');
        if (quantityControl && this.selectedItem) {
          quantityControl.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(this.selectedItem.quantity)
          ]);
          quantityControl.updateValueAndValidity();
        }
      });
    }
  }

  private loadInventoryItems(): void {
    this.loading = true;
    this.inventoryService.getInventoryItems().subscribe({
      next: (response) => {
        this.inventoryItems = response.data.filter(item => item.quantity > 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading inventory items:', error);
        this.loading = false;
      }
    });
  }

  getAvailableQuantity(): number {
    return this.selectedItem?.quantity ?? 0;
  }

  getRemainingQuantity(): number {
    const quantity = Number(this.getControlValue('quantity')) || 0;
    return (this.selectedItem?.quantity ?? 0) - quantity;
  }

  isBelowMinimum(): boolean {
    if (!this.selectedItem) return false;
    return this.getRemainingQuantity() < (this.selectedItem.minimumQuantity || 0);
  }

  onSubmit(): void {
    if (this.disbursementForm.valid && this.selectedItem) {
      this.loading = true;
      
      const disbursement: CreateStockDisbursement = {
        ...this.disbursementForm.value,
        status: 'pending'
      };

      this.inventoryService.createDisbursement(disbursement).subscribe({
        next: () => {
          const newQuantity = this.getRemainingQuantity();
          this.inventoryService.updateInventoryItem(
            this.selectedItem!.id,
            { quantity: newQuantity }
          ).subscribe({
            next: () => {
              this.router.navigate(['/inventory']);
            }
          });
        },
        error: (error) => {
          console.error('Error creating disbursement:', error);
          this.loading = false;
        }
      });
    }
  }
}