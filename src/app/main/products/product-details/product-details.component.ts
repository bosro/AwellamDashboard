import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../shared/types/product.interface';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  loading = false;
  activeTab: 'overview' | 'inventory' | 'sales' | 'reviews' = 'overview';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: 'overview' | 'inventory' | 'sales' | 'reviews'): void {
    this.activeTab = tab;
  }



  deleteProduct(): void {
    if (!this.product || !confirm('Are you sure you want to delete this product?')) return;

    // this.productsService.deleteProduct(this.product._id).subscribe({
    //   next: () => {
    //     this.router.navigate(['/main/products/list']);
    //   },
    //   error: (error) => console.error('Error deleting product:', error)
    // });
  }
}