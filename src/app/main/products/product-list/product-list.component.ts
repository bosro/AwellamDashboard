import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { Product, ProductStatus } from '../../../shared/types/product.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  currentPage = 1;
  selectedProducts = new Set<string>();
  filterForm: FormGroup;
  exportDropdown = false; // Added missing property
  categories: Category[] = []; // Added missing property
  Math = Math; // Added for template usage
  
  constructor(
    private productsService: ProductsService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      status: [''],
      minPrice: [''],
      maxPrice: [''],
      inStock: ['']
    });
  }

  ngOnInit(): void {
    this.setupFilters();
    this.loadProducts();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  loadProducts(): void {
    this.loading = true;
    const params = {
      ...this.filterForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.productsService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  toggleSelection(productId: string): void {
    if (this.selectedProducts.has(productId)) {
      this.selectedProducts.delete(productId);
    } else {
      this.selectedProducts.add(productId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedProducts.size === this.products.length) {
      this.selectedProducts.clear();
    } else {
      this.products.forEach(product => this.selectedProducts.add(product.id));
    }
  }

  bulkUpdateStatus(status: 'active' | 'inactive' | 'draft' | 'discontinued'): void {
    if (this.selectedProducts.size === 0) return;

    this.productsService.bulkUpdateStatus(Array.from(this.selectedProducts), status as ProductStatus)
      .subscribe({
        next: () => {
          this.selectedProducts.clear();
          this.loadProducts();
        },
        error: (error) => console.error('Error updating status:', error)
      });
  }

  exportProducts(format: 'csv' | 'excel'): void {
    this.productsService.exportProducts(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products-export.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting products:', error)
    });
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => console.error('Error deleting product:', error)
      });
    }
  }
}