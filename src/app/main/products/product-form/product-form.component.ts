// product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from "../../../services/products.service";

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
 productForm: FormGroup;
 isEditMode = false;
 loading = false;
 imageFile?: File;

 constructor(
   private fb: FormBuilder,
   private productsService: ProductsService,
   private route: ActivatedRoute,
   private router: Router
 ) {
   this.productForm = this.fb.group({
     name: ['', Validators.required],
     price: ['', [Validators.required, Validators.min(0)]],
     description: ['', Validators.required],
     inStock: [true],
     totalStock: ['', [Validators.required, Validators.min(0)]],
     image: ['string']
   });
 }

 ngOnInit(): void {
   const id = this.route.snapshot.paramMap.get('id');
   if (id) {
     this.isEditMode = true; 
     this.loadProduct(id);
   }
 }

 onSubmit(): void {
   if (this.productForm.valid) {
     const formData = new FormData();
     formData.append('name', this.productForm.get('name')?.value);
     formData.append('price', this.productForm.get('price')?.value);
     formData.append('description', this.productForm.get('description')?.value);
     formData.append('inStock', this.productForm.get('inStock')?.value);
     formData.append('totalStock', this.productForm.get('totalStock')?.value);
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