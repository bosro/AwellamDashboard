import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../shared/types/product.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

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
  filteredProducts: Product[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  currentPage = 1;
  selectedProducts = new Set<string>();
  filterForm: FormGroup;
  exportDropdown = false;
  categories: Category[] = [];
  Math = Math;

  constructor(
    private productsService: ProductsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
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
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }
  toggleStock(productId: string): void {
    this.productsService.toggleStock(productId).subscribe({
      next: () => {
        this.showSnackBar('Stock status toggled successfully');
        this.loadProducts();
      },
      error: (error) => {
        this.showSnackBar('Error toggling stock status', true);
        console.error('Error toggling stock:', error);
      }
    });
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.deleteProduct(productId).subscribe({
        next: () => {
          this.showSnackBar('Product deleted successfully');
          this.loadProducts();
        },
        error: (error) => {
          this.showSnackBar('Error deleting product', true);
          console.error('Error deleting product:', error);
        }
      });
    }
  }
  
  loadProducts(): void {
    this.loading = true;
    this.productsService.getProducts({})
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.products = response.products;
          this.total = this.products.length;
          this.applyFilters();
        },
        error: (error) => {
          this.showSnackBar('Error loading products', true);
          console.error('Error loading products:', error);
        }
      });
  }

  applyFilters(): void {
    const { search, category, status, minPrice, maxPrice, inStock } = this.filterForm.value;

    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || product.categoryId === category;
      const matchesMinPrice = !minPrice || product.price >= minPrice;
      const matchesMaxPrice = !maxPrice || product.price <= maxPrice;
      const matchesInStock = inStock === '' || product.inStock === (inStock === 'true');

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesInStock;
    });

    this.total = this.filteredProducts.length;
    this.filteredProducts = this.filteredProducts.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
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
    const headers = ['ID', 'Name', 'Price', 'Category', 'In Stock', 'Total Stock', 'Image'];
    const rows = this.products.map(product => [
      product._id,
      product.name,
      product.price,
      product.categoryId.name,
      product.inStock ? 'Yes' : 'No',
      product.totalStock,
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

  showSnackBar(message: string, isError = false) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}