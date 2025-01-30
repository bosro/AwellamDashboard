// product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { PlantService, Plant, Category } from '../../../services/plant.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  loading = false;
  imageFile?: File;
  plants: Plant[] = [];
  categories: Category[] = [];
  selectedPlant?: string;

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
      price: ['', [Validators.required, Validators.min(0)]],
      plantId: ['', Validators.required],
      categoryId: ['', Validators.required],
      inStock: [true],
      totalStock: ['', [Validators.required, Validators.min(0)]],
      image: ['']
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

  onPlantChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const plantId = selectElement.value;
    if (plantId) {
      this.loading = true;
      this.plantService.getCategoriesByPlant(plantId)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            this.categories = response.categories;
            this.productForm.patchValue({ categoryId: '' });
          },
          error: (error) => console.error('Error loading categories:', error)
        });
    } else {
      this.categories = [];
      this.productForm.patchValue({ categoryId: '' });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const formValue = this.productForm.value;
      
      // Let's log the values to see what we're sending
      console.log('Form Values:', formValue);
      
      // Create a regular object instead of FormData since your backend might 
      // be expecting JSON data (as it works in Postman)
      const productData = {
        name: formValue.name,
        price: Number(formValue.price), // Convert to number
        plantId: formValue.plantId,
        categoryId: formValue.categoryId,
        totalStock: Number(formValue.totalStock), // Convert to number
        inStock: formValue.inStock
      };
  
      // Log the final payload
      console.log('Payload:', productData);
  
      const request$ = this.isEditMode
        ? this.productsService.updateProduct(this.route.snapshot.paramMap.get('id')!, productData)
        : this.productsService.createProduct(productData);
  
      request$
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            console.log('Response:', response);
            this.router.navigate(['/main/products/list']);
          },
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

  onImageUpload(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList && fileList.length > 0) {
      this.imageFile = fileList[0];
    }
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.productsService.getProductById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (product) => {
          this.productForm.patchValue({
            name: product.name,
            price: product.price,
            plantId: product.plantId,
            categoryId: product.categoryId._id,
            inStock: product.inStock,
            totalStock: product.totalStock
          });
          if (product.plantId) {
            this.onPlantChange({ target: { value: product.plantId } } as unknown as Event);
          }
        },
        error: (error) => console.error('Error loading product:', error)
      });
  }
}