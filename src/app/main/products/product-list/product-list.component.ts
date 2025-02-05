import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../shared/types/product.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Category {
  _id: string;
  name: string;
}

interface Plant {
  _id: string;
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
  plants: Plant[] = [];
  Math = Math;

  private apiUrl = `${environment.apiUrl}`

  constructor(
    private productsService: ProductsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      plant: [''],
      category: [''],
      status: [''],
      minPrice: [''],
      maxPrice: [''],
      inStock: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilters();
  }

  private loadInitialData(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/plants/get`).subscribe({
      next: (response) => {
        this.plants = response.plants;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.loading = false;
      }
    });
  }

  private loadProducts(): void {
    this.productsService.getProducts({}).subscribe({
      next: (response) => {
        this.products = response.products;
        this.total = this.products.length;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
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
        this.applyFilters();
      });

    this.filterForm.get('plant')?.valueChanges.subscribe(plantId => {
      if (plantId) {
        this.loadCategories(plantId);
      } else {
        this.categories = [];
        this.filterForm.patchValue({ category: '' });
      }
    });

    this.filterForm.get('category')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.onCategorySelect(categoryId);
      } else {
        this.products = [];
        this.applyFilters();
      }
    });
  }

  private loadCategories(plantId: string): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/category/plants/${plantId}`).subscribe({
      next: (response) => {
        this.categories = response.categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  onCategorySelect(categoryId: string): void {
    if (categoryId) {
      this.loading = true;
      this.http.get<any>(`${this.apiUrl}/products/category/${categoryId}`).subscribe({
        next: (response) => {
          this.products = response.products;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
        }
      });
    } else {
      this.products = [];
      this.applyFilters();
    }
  }

  applyFilters(): void {
    const { search, plant, category, status, minPrice, maxPrice, inStock } = this.filterForm.value;

    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
      const matchesPlant = !plant || product.plantId._id === plant;
      const matchesCategory = !category || product.categoryId._id === category;
      const matchesMinPrice = !minPrice || product.price >= minPrice;
      const matchesMaxPrice = !maxPrice || product.price <= maxPrice;
      const matchesInStock = inStock === '' || product.inStock === (inStock === 'true');

      return matchesSearch && matchesPlant && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesInStock;
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

  showSnackBar(message: string, isError = false) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}