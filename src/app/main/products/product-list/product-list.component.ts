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
  products!: Product[];
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
    // this.loadCategories();
  }

  // private loadCategories(): void {
  //   this.productsService.getCategories().subscribe({
  //     next: (categories) => {
  //       this.categories = categories;
  //     },
  //     error: (error) => console.error('Error loading categories:', error)
  //   });
  // }

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
  
    this.productsService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products.map(product => ({
          ...product,
          categoryId: product.categoryId // Ensure categoryId is a string
        })); // Use the 'products' field from the API response
        this.total = response.products.length; // Set total based on the array size if pagination is not provided in the API
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  // deleteProduct(productId: string): void{
  //   this.productsService.deleteProduct
  // }

  // deleteProduts(productId: string):void{
  //   this.productsService.deleteProduct(productId).subscribe()

  // }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.deleteProduct(productId).subscribe({
        next: () => this.loadProducts(),
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }


  // In product-list.component.ts
// exportToExcel(): void {
//   this.productsService.exportToExcel(this.products);
// }

toggleStock(productId: string): void {
  this.productsService.toggleStock(productId).subscribe({
    next: () => this.loadProducts(),
    error: (error) => console.error('Error toggling stock:', error)
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
      this.products.forEach(product => this.selectedProducts.add(product._id));
    }
  }



  exportProducts(format: 'csv' | 'excel'): void {
    if (format === 'csv') {
      this.exportToCSV();
    } else if (format === 'excel') {
      this.exportToExcel();
    }
  }

  private exportToCSV(): void {
    const headers = ['ID', 'Name', 'SKU', 'Price', 'Description', 'In Stock', 'Image'];
    const rows = this.products.map(product => [
      product._id,
      product.name,
      product.price,
      product.categoryId,
      product.inStock ? 'Yes' : 'No',
      product.image
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products-export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private exportToExcel(): void {
    // Implement Excel export logic here
    console.error('Excel export is not implemented yet.');
  }

  // deleteProduct(productId: string): void {
  //   if (confirm('Are you sure you want to delete this product?')) {
  //     this.productsService.deleteProduct(productId).subscribe({
  //       next: () => {
  //         this.loadProducts();
  //       },
  //       error: (error) => console.error('Error deleting product:', error)
  //     });
  //   }
  // }
}