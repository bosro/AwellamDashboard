import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';


export interface Product {
  _id: string;
  name: string;
  price: number;
  categoryId: {
    _id: string;
    name: string;
  };
  inStock: boolean;
  totalStock: number;
  image: string;
}

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  loading = false;
  // stockQuantity = 0;
  stockQuantity: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  addStock(): void {
    if (!this.product || this.stockQuantity <= 0) return;
    
    this.productsService.addStock(this.product._id, this.stockQuantity).subscribe({
      next: (updatedProduct) => {
        this.product = updatedProduct;
        this.stockQuantity = 0;
      },
      error: (error) => console.error('Error adding stock:', error)
    });
  }

  toggleStock(): void {
    if (!this.product) return;
    
    this.productsService.toggleStock(this.product._id).subscribe({
      next: (updatedProduct) => {
        this.product = updatedProduct;
      },
      error: (error) => console.error('Error toggling stock status:', error)
    });
  }

  private loadProduct(_id: string): void {
    this.loading = true;
    this.productsService.getProductById(_id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        // console.log(this.product)
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }
}