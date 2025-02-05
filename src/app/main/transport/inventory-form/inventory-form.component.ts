import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss']
})
export class InventoryFormComponent implements OnInit {
  inventoryForm!: FormGroup;
  isEditMode = false;
  loading = false;
  itemId!: number;

  stockTypes = ['tires', 'oils', 'rims', 'batteries'];
  locations = ['Warehouse A', 'Warehouse B', 'Storage C'];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.itemId = this.route.snapshot.params['id'];
    if (this.itemId) {
      this.isEditMode = true;
      this.loadItem();
    }
  }

  private createForm(): void {
    this.inventoryForm = this.fb.group({
      itemName: ['', [Validators.required]],
      stockType: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      minimumQuantity: [0, [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      supplier: [''],
      status: ['in-stock']
    });
  }

  BacktoInventory(){
    this.router.navigate(['main/inventory/']);
  }

  // Type-safe helper methods for form validation
  hasError(controlName: string, errorType: string): boolean {
    const control = this.inventoryForm.get(controlName);
    if (!control) return false;
    return control.touched && control.errors?.[errorType];
  }

  getControl(controlName: string): AbstractControl | null {
    return this.inventoryForm.get(controlName);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.getControl(controlName);
    return control ? control.invalid && control.touched : false;
  }

  private loadItem(): void {
    this.loading = true;
    this.inventoryService.getInventoryItemById(this.itemId).subscribe({
      next: (item: any) => {
        this.inventoryForm.patchValue(item);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading inventory item:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.inventoryForm.valid) {
      this.loading = true;
      const item = this.inventoryForm.value;
      item.status = this.calculateStatus(item.quantity, item.minimumQuantity);

      const request = this.isEditMode
        ? this.inventoryService.updateInventoryItem(this.itemId, item)
        : this.inventoryService.createInventoryItem(item);

      request.subscribe({
        next: () => {
          this.router.navigate(['/inventory']);
        },
        error: (error: any) => {
          console.error('Error saving inventory item:', error);
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.inventoryForm.controls).forEach(key => {
        const control = this.getControl(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  private calculateStatus(quantity: number, minimumQuantity: number): string {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= minimumQuantity) return 'low-stock';
    return 'in-stock';
  }
}