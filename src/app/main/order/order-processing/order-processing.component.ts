// order-processing.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../../../services/order.service';
import { forkJoin, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-processing',
  templateUrl: './order-processing.component.html'
})
export class OrderProcessingComponent implements OnInit {
  orderForm: FormGroup;
  loading = false;
  saving = false;
  products: any[] = [];
  customers: any[] = [];
  plants: any[] = [];
  categories: any[] = [];
  selectedProduct: any;
  selectedCustomer: any;
  noProductsFound = false;
  noCategoriesFound = false;

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private router: Router,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      plant: ['', Validators.required],
      category: ['', Validators.required],
      product: ['', Validators.required],
      customer: this.fb.group({
        id: ['', Validators.required],
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        address: ['', Validators.required],
      }),
      items: this.fb.array([]),
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.fetchPlantsAndCustomers();
  }

  private fetchPlantsAndCustomers(): void {
    this.loading = true;
    forkJoin({
      plants: this.http.get<any>(`${this.apiUrl}/plants/get`),
      customers: this.http.get<any>(`${this.apiUrl}/customers/get`)
    }).subscribe({
      next: ({ plants, customers }) => {
        this.plants = plants.plants;
        this.customers = customers.customers;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => this.loading = false
    });
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    if (plantId) {
      this.loading = true;
      this.noCategoriesFound = false;
      this.http.get<any>(`${this.apiUrl}/category/plants/${plantId}`).subscribe({
        next: (response) => {
          this.categories = response.categories;
          this.noCategoriesFound = this.categories.length === 0;
          this.orderForm.patchValue({ category: '', product: '' });
          this.products = [];
        },
        error: (error) => console.error('Error loading categories:', error),
        complete: () => this.loading = false
      });
    } else {
      this.categories = [];
      this.noCategoriesFound = false;
      this.orderForm.patchValue({ category: '', product: '' });
    }
  }

  onCategorySelect(event: any): void {
    const categoryId = event.target.value;
    if (categoryId) {
      this.loading = true;
      this.noProductsFound = false;
      this.http.get<any>(`${this.apiUrl}/products/category/${categoryId}`).subscribe({
        next: (response) => {
          this.products = response.products;
          this.noProductsFound = this.products.length === 0;
          this.orderForm.patchValue({ product: '' });
        },
        error: (error) => console.error('Error loading products:', error),
        complete: () => this.loading = false
      });
    } else {
      this.products = [];
      this.noProductsFound = false;
      this.orderForm.patchValue({ product: '' });
    }
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  updateItemTotal(itemGroup: FormGroup): void {
    const quantity = itemGroup.get('quantity')?.value || 0;
    const price = itemGroup.get('price')?.value || 0;
    const total = quantity * price;
    itemGroup.patchValue({ total: total }, { emitEvent: false });
  }

  addItem(product: any): void {
    const itemGroup = this.fb.group({
      productId: [product._id],
      name: [product.name],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [product.price, [Validators.required, Validators.min(0)]],
      total: [{ value: product.price, disabled: true }]
    });

    // Subscribe to both quantity and price changes
    combineLatest([
      itemGroup.get('quantity')!.valueChanges,
      itemGroup.get('price')!.valueChanges
    ]).subscribe(() => {
      this.updateItemTotal(itemGroup);
      this.calculateOrderTotals();
    });

    this.items.push(itemGroup);
    this.calculateOrderTotals();
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateOrderTotals();
  }

  private calculateOrderTotals(): number {
    return this.items.controls.reduce((total, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return total + (quantity * price);
    }, 0);
  }

  getTotal(): number {
    return this.calculateOrderTotals();
  }


  onProductSelect(event: any): void {
    const productId = event.target.value;
    this.selectedProduct = this.products.find(product => product._id === productId);
    if (this.selectedProduct) {
      this.addItem(this.selectedProduct);
    }
  }

  onCustomerSelect(event: any): void {
    const customerId = event.target.value;
    this.selectedCustomer = this.customers.find(customer => customer._id === customerId);
    if (this.selectedCustomer) {
      this.orderForm.patchValue({
        customer: {
          id: this.selectedCustomer._id,
          name: this.selectedCustomer.fullName,
          email: this.selectedCustomer.email,
          phone: this.selectedCustomer.phoneNumber,
          address: this.selectedCustomer.address
        }
      });
    }
  }

  onSubmit(): void {
    if (this.orderForm.valid && this.items.length > 0) {
      this.saving = true;
      
      const orderData = {
        customerId: this.orderForm.value.customer.id,
        orderItems: this.items.value.map((item: any) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        })),
        deliveryAddress: this.orderForm.value.customer.address,
        totalAmount: this.getTotal(),
        notes: this.orderForm.value.notes,
        plantId: this.orderForm.value.plant,
        categoryId: this.orderForm.value.category
      };

      this.ordersService.createOrder(orderData).subscribe({
        next: () => {
          this.router.navigate(['main/orders/list']);
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.saving = false;
        }
      });
    }
  }
}