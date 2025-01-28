import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from "../../../services/products.service";
import { Plant, PurchasingService } from '../../../services/purchasing.service';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  totalStock: number;
  image: string;
}

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
[x: string]: any;
  productForm: FormGroup;
  isEditMode = false;
  loading = false;
  imageFile?: File;
  plants!: Plant[];
  selectedPlant!: string;
  i!: string

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private purchasingService: PurchasingService,
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      inStock: [true],
      totalStock: ['', [Validators.required, Validators.min(0)]],
      image: [''],
      plantType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.getPlants();
    if (id) {
      this.isEditMode = true;
      this.loadProduct(id);
    }
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

  onPlantChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const plantId = selectElement.value;
    this.selectedPlant = plantId; // This is now set to the selected plant ID
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('inStock', this.productForm.get('inStock')?.value);
      formData.append('totalStock', this.productForm.get('totalStock')?.value);
      formData.append('plantType', this.productForm.get('plantType')?.value);
      formData.append('image', 'string');
      if (this.imageFile) {
        formData.append('imageFile', this.imageFile);
      }

      if (this.isEditMode) {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.productsService.updateProduct(id, formData).subscribe({
          next: () => this.router.navigate(['/main/products/list']),
          error: (error) => console.error('Error updating product:', error)
        });
      } else {
        this.productsService.createProduct(formData).subscribe({
          next: () => this.router.navigate(['/main/products/list']),
          error: (error) => console.error('Error creating product:', error)
        });
      }
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
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
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }
}