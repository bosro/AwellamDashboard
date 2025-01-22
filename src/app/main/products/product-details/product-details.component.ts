// components/product-details/product-details.component.ts
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
  salesHistory: any[] = [];
  inventoryMovements: any[] = [];
  reviews: any[] = [];
  relatedProducts: Product[] = [];
  
  // Charts data
  salesChartData: any[] = [];
  inventoryChartData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
      this.loadSalesHistory(productId);
      this.loadInventoryMovements(productId);
      this.loadReviews(productId);
      this.loadRelatedProducts(productId);
    }
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.prepareSalesChart();
        this.prepareInventoryChart();
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  private loadSalesHistory(productId: string): void {
    // Implement sales history loading
  }

  private loadInventoryMovements(productId: string): void {
    // Implement inventory movements loading
  }

  private loadReviews(productId: string): void {
    // Implement reviews loading
  }

  private loadRelatedProducts(productId: string): void {
    // Implement related products loading
  }

  private prepareSalesChart(): void {
    // Transform sales data for chart
    this.salesChartData = this.salesHistory.map(sale => ({
      date: sale.date,
      amount: sale.amount,
      quantity: sale.quantity
    }));
  }

  private prepareInventoryChart(): void {
    // Transform inventory data for chart
    this.inventoryChartData = this.inventoryMovements.map(movement => ({
      date: movement.date,
      quantity: movement.quantity,
      type: movement.type
    }));
  }

  setActiveTab(tab: 'overview' | 'inventory' | 'sales' | 'reviews'): void {
    this.activeTab = tab;
  }

  updateStatus(status: any): void {
    if (!this.product) return;
    
    this.productsService.updateProduct(this.product.id, { status }).subscribe({
      next: (updatedProduct) => {
        this.product = updatedProduct;
      },
      error: (error) => console.error('Error updating status:', error)
    });
  }

  deleteProduct(): void {
    if (!this.product || !confirm('Are you sure you want to delete this product?')) return;

    this.productsService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.router.navigate(['/products/list']);
      },
      error: (error) => console.error('Error deleting product:', error)
    });
  }
}