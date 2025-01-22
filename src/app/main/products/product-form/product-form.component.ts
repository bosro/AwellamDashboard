// components/product-form/product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { Product, ProductStatus, Category } from '../../../shared/types/product.interface';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  loading = false;
  saving = false;
  categories: Category[] = [];
  imageFiles: File[] = [];
  currentProduct?: Product;
  activeSection = 'basic info'; 

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      basicInfo: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        sku: ['', Validators.required],
        description: ['', Validators.required],
        categoryId: ['', Validators.required],
        brandId: [''],
        status: [ProductStatus.DRAFT],
        tags: [[]]
      }),
      pricing: this.fb.group({
        base: [0, [Validators.required, Validators.min(0)]],
        discounted: [null, Validators.min(0)],
        wholesale: [null, Validators.min(0)],
        currency: ['USD', Validators.required]
      }),
      inventory: this.fb.group({
        quantity: [0, [Validators.required, Validators.min(0)]],
        reorderPoint: [0, [Validators.required, Validators.min(0)]],
        reorderQuantity: [0, [Validators.required, Validators.min(0)]],
        location: ['', Validators.required]
      }),
      specifications: this.fb.array([]),
      variants: this.fb.array([]),
      seo: this.fb.group({
        metaTitle: [''],
        metaDescription: [''],
        urlSlug: [''],
        keywords: [[]]
      })
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEditMode = true;
      this.loadProduct(productId);
    }
  }

  private loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
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
    // Basic Info
    this.productForm.patchValue({
      basicInfo: {
        name: product.name,
        sku: product.sku,
        description: product.description,
        categoryId: product.categoryId,
        brandId: product.brandId,
        status: product.status,
        tags: product.tags
      },
      pricing: {
        base: product.price.base,
        discounted: product.price.discounted,
        wholesale: product.price.wholesale,
        currency: product.price.currency
      },
      inventory: {
        quantity: product.inventory.quantity,
        reorderPoint: product.inventory.reorderPoint,
        reorderQuantity: product.inventory.reorderQuantity,
        location: product.inventory.location
      }
    });

    // Specifications
    const specArray = this.productForm.get('specifications') as FormArray;
    specArray.clear();
    Object.entries(product.specifications).forEach(([key, value]) => {
      specArray.push(this.fb.group({
        key: [key, Validators.required],
        value: [value, Validators.required]
      }));
    });

    // Variants
    const variantsArray = this.productForm.get('variants') as FormArray;
    variantsArray.clear();
    product.variants.forEach(variant => {
      variantsArray.push(this.createVariantFormGroup(variant));
    });
  }

  createVariantFormGroup(variant?: any): FormGroup {
    return this.fb.group({
      sku: [variant?.sku || '', Validators.required],
      name: [variant?.name || '', Validators.required],
      price: [variant?.price || 0, [Validators.required, Validators.min(0)]],
      inventory: [variant?.inventory || 0, [Validators.required, Validators.min(0)]],
      attributes: this.fb.group(variant?.attributes || {})
    });
  }

  addSpecification(): void {
    const specArray = this.productForm.get('specifications') as FormArray;
    specArray.push(this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  removeSpecification(index: number): void {
    const specArray = this.productForm.get('specifications') as FormArray;
    specArray.removeAt(index);
  }

  addVariant(): void {
    const variantsArray = this.productForm.get('variants') as FormArray;
    variantsArray.push(this.createVariantFormGroup());
  }

  removeVariant(index: number): void {
    const variantsArray = this.productForm.get('variants') as FormArray;
    variantsArray.removeAt(index);
  }

  onImageUpload(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList) {
      // Explicitly type the array conversion
      const filesArray: File[] = Array.from(fileList);
      this.imageFiles = [...this.imageFiles, ...filesArray];
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
          await this.productsService.updateProduct(this.currentProduct.id, formData).toPromise();
        } else {
          await this.productsService.createProduct(formData).toPromise();
        }
        this.router.navigate(['/products/list']);
      } catch (error) {
        console.error('Error saving product:', error);
      } finally {
        this.saving = false;
      }
    }
  }

  private prepareFormData(): any {
    const formValue = this.productForm.value;
    const formData = new FormData();

    // Append basic product data
    formData.append('data', JSON.stringify({
      ...formValue.basicInfo,
      price: formValue.pricing,
      inventory: formValue.inventory,
      specifications: this.transformSpecifications(formValue.specifications),
      variants: formValue.variants,
      seo: formValue.seo
    }));

    // Append images
    this.imageFiles.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    return formData;
  }

  private transformSpecifications(specs: any[]): { [key: string]: string } {
    return specs.reduce((acc, spec) => ({
      ...acc,
      [spec.key]: spec.value
    }), {});
  }
}