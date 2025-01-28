import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TruckService } from '../../../services/truck.service';
import { Truck, TruckLoad } from '../../../shared/types/truck-operation.types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-truck-details',
  templateUrl: './truck-detail.component.html',
})
export class TruckDetailsComponent implements OnInit {
  truck?: Truck;
  loading = false;
  showLoadForm = false;
  loadForm: FormGroup;
  products: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private truckService: TruckService,
    private productService: ProductsService,
    private fb: FormBuilder
  ) {
    this.loadForm = this.fb.group({
      capacity: ['', [Validators.required, Validators.min(0)]],
      productId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTruckDetails(id);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  private loadTruckDetails(id: string): void {
    this.loading = true;
    this.truckService.getTruckById(id).subscribe({
      next: (response) => {
        this.truck = response.truck;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading truck details:', error);
        this.loading = false;
      }
    });
  }

  loadTruck(): void {
    if (this.loadForm.valid && this.truck) {
      const loadData = {
        capacity: this.loadForm.get('capacity')?.value.toString(),
        productId: this.loadForm.get('productId')?.value,
        truckId: this.truck._id
      };
  
      this.truckService.loadTruck(loadData).subscribe({
        next: () => {
          this.showLoadForm = false;
          this.loadTruckDetails(this.truck!._id);
        },
        error: (error) => console.error('Error loading truck:', error)
      });
    }
  }

  getStatusClass(status: Truck['status']): string {
    return {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    }[status] || '';
  }
}