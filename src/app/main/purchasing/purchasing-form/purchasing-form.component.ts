import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Plant, PurchasingService } from '../../../services/purchasing.service';
import { Product } from '../../../services/products.service';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchasing-form.component.html',
  styleUrls: ['./purchasing-form.component.css']
})
export class PurchaseFormComponent implements OnInit {
  purchaseForm!: FormGroup;
  isEditMode = false;
  loading = false;
  purchaseId!: string;
  plants!: Plant[];
  categories: { [key: string]: any[] } = {}; // Store categories by plant ID
  products: { [key: string]: Product[] } = {}; // Store products by category ID

  constructor(
    private fb: FormBuilder,
    private purchasingService: PurchasingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.purchaseForm = this.fb.group({
      purchaseDate: [new Date().toISOString().split('T')[0], Validators.required],
      paymentReference: ['', Validators.required],
      salesOrderNumber: ['', [Validators.required]],
      purchases: this.fb.array([this.createPurchaseGroup()])
    });
  }

  ngOnInit(): void {
    this.purchaseId = this.route.snapshot.params['id'];
    if (this.purchaseId) {
      this.isEditMode = true;
      this.loadPurchase();
    }
    this.getPlants();
  }

  private createPurchaseGroup(): FormGroup {
    return this.fb.group({
      plantId: ['', Validators.required],
      categoryId: ['', Validators.required],
      productId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  get purchases(): FormArray {
    return this.purchaseForm.get('purchases') as FormArray;
  }

  addPurchase(): void {
    this.purchases.push(this.createPurchaseGroup());
  }

  removePurchase(index: number): void {
    this.purchases.removeAt(index);
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

  private getPlants(): void {
    this.loading = true;
    this.purchasingService.getPlants().subscribe({
      next: (response) => {
        this.plants = response.plants;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.loading = false;
      }
    });
  }

  getCategories(plantId: string, index: number): void {
    if (!plantId) {
      this.categories[plantId] = []; // If no plant ID, reset the categories array
      return;
    }

    this.loading = true;
    this.purchasingService.getCategoriesByPlantId(plantId).subscribe({
      next: (response) => {
        this.categories[plantId] = response.categories; // Update categories for the selected plant
        this.purchases.at(index).get('categoryId')?.setValue(''); // Reset the category selection for the current purchase
        this.products = {}; // Reset products
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  getProducts(categoryId: string, index: number): void {
    if (!categoryId) {
      this.products[categoryId] = []; // If no category ID, reset the products array
      return;
    }

    this.loading = true;
    this.purchasingService.getProductsByCategoryId(categoryId).subscribe({
      next: (response) => {
        this.products[categoryId] = response.products; // Update products for the selected category
        this.purchases.at(index).get('productId')?.setValue(''); // Reset the product selection for the current purchase
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onPlantChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const plantId = selectElement.value;
    this.getCategories(plantId, index); // Fetch categories for the selected plant
  }

  onCategoryChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const categoryId = selectElement.value;
    this.getProducts(categoryId, index); // Fetch products for the selected category
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
        case 'salesOrderNumber':
          return 'Must be in format followed by 9 digits';
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
}