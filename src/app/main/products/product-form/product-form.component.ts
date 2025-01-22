import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { Product, Category } from '../../../shared/types/product.interface';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'] // Add this if you have specific styles
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  loading = false;
  saving = false;
  categories: Category[] = [];
  imageFiles: File[] = [];
  currentProduct?: Product;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: [0, [Validators.required]],
      description: ['', Validators.required],
      inStock: [true, Validators.required],
      totalStock: [0, [Validators.required]],
      image: [null]
    });
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEditMode = true;
      this.loadProduct(productId);
    }
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        this.currentProduct = product;
        this.patchFormValues(product);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  private patchFormValues(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      description: product.description,
      inStock: product.inStock,
      totalStock: product.totalStock
    });
  }

  onImageUpload(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList) {
      this.imageFiles = Array.from(fileList);
    }
  }

  removeImage(index: number): void {
    this.imageFiles.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.valid) {
      this.saving = true;
      const formData = this.prepareFormData();

      try {
        if (this.isEditMode && this.currentProduct) {
          await this.productsService.updateProduct(this.currentProduct._id, formData).toPromise();
        } else {
          await this.productsService.createProduct(formData).toPromise();
        }
        this.router.navigate(['/main/products/list']);
      } catch (error) {
        console.error('Error saving product:', error);
      } finally {
        this.saving = false;
      }
    }
  }

  private prepareFormData(): FormData {
    const formValue = this.productForm.value;
    const formData = new FormData();

    formData.append('name', formValue.name);
    formData.append('price', formValue.price);
    formData.append('description', formValue.description);
    formData.append('inStock', formValue.inStock.toString());
    formData.append('totalStock', formValue.totalStock.toString());
    if (this.imageFiles.length > 0) {
      formData.append('image', this.imageFiles[0]);
    }

    return formData;
  }
}
