import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { PlantService, Plant } from '../../../services/plant.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  loading = false;
  plants: Plant[] = [];
  destinations: any[] = [];
  imageBase64: string | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private plantService: PlantService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      costprice: ['', [Validators.required, Validators.min(0)]],
      plantId: ['', Validators.required],
      totalStock: ['', [Validators.required, Validators.min(0)]],
      inStock: [true],
      image: [''],
    });
  }

  ngOnInit(): void {
    this.loadPlants();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadProduct(id);
    }
  }

  private loadPlants(): void {
    this.loading = true;
    this.plantService.getPlants()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.plants = response.plants;
        },
        error: (error) => console.error('Error loading plants:', error)
      });
  }

  onPlantSelect(event: Event): void {
    // Optionally load destinations or other plant-specific data here
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
        this.imagePreview = this.imageBase64;
        this.productForm.patchValue({ image: this.imageBase64 });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const formValue = this.productForm.value;
      const productData = {
        name: formValue.name,
        costprice: Number(formValue.costprice),
        plantId: formValue.plantId,
        totalStock: Number(formValue.totalStock),
        inStock: formValue.inStock,
        image: this.imageBase64,
      };

      const request$ = this.isEditMode
        ? this.productsService.updateProduct(this.route.snapshot.paramMap.get('id')!, productData)
        : this.productsService.createProduct(productData);

      request$
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => this.router.navigate(['/main/products/list']),
          error: (error) => {
            console.error('Error saving product:', error);
            this.loading = false;
          }
        });
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.productsService.getProductById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (product) => {
          this.productForm.patchValue({
            name: product?.name,
            costprice: product.costprice,
            plantId: product.plantId,
            totalStock: product.totalStock,
            inStock: product.inStock,
            image: product.image,
          });
          if (product.image) {
            this.imagePreview = product.image;
            this.imageBase64 = product.image;
          }
        },
        error: (error) => console.error('Error loading product:', error)
      });
  }
}