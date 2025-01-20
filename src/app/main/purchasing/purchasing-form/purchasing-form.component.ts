import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchasingService } from '../../../services/purchasing.service';
import { PurchaseStatus, StatusClassMap } from '../../../shared/types/purchase-types';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchasing-form.component.html',
  styleUrls: ['./purchasing-form.component.css']
})
export class PurchaseFormComponent implements OnInit {
  purchaseForm!: FormGroup;
  isEditMode = false;
  loading = false;
  purchaseId!: number;

  productTypes = ['42.5R', '32.5N']; // Add more as needed
  locations = ['Plant A', 'Plant B', 'Plant C']; // Add more as needed

  private readonly statusClasses: StatusClassMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  constructor(
    private fb: FormBuilder,
    private purchasingService: PurchasingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.purchaseId = this.route.snapshot.params['id'];
    if (this.purchaseId) {
      this.isEditMode = true;
      this.loadPurchase();
    }
  }

  private createForm(): void {
    this.purchaseForm = this.fb.group({
      purchaseDate: ['', Validators.required],
      paymentReference: ['', [Validators.required, Validators.pattern(/^PR\d{11}$/)]],
      salesOrderNumber: ['', [Validators.required, Validators.pattern(/^SOC\d{9}$/)]],
      productType: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      status: ['pending']
    });
  }

  private loadPurchase(): void {
    this.loading = true;
    this.purchasingService.getPurchaseById(this.purchaseId).subscribe({
      next: (purchase) => {
        this.purchaseForm.patchValue(purchase);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading purchase:', error);
        this.loading = false;
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.purchaseForm.get(controlName);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) {
      return `${this.formatFieldName(controlName)} is required`;
    }

    if (control.errors['min']) {
      return `${this.formatFieldName(controlName)} must be greater than 0`;
    }

    if (control.errors['pattern']) {
      switch (controlName) {
        case 'paymentReference':
          return 'Must be in format PR followed by 11 digits';
        case 'salesOrderNumber':
          return 'Must be in format SOC followed by 9 digits';
        default:
          return 'Invalid format';
      }
    }

    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      this.loading = true;
      const purchase = this.purchaseForm.value;

      const request = this.isEditMode
        ? this.purchasingService.updatePurchase(this.purchaseId, purchase)
        : this.purchasingService.createPurchase(purchase);

      request.subscribe({
        next: () => {
          this.router.navigate(['/purchases']);
        },
        error: (error) => {
          console.error('Error saving purchase:', error);
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.purchaseForm.controls).forEach(key => {
        const control = this.purchaseForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  // Helper method to get status classes
  getStatusClass(status: PurchaseStatus): string {
    return this.statusClasses[status];
  }
}