import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../../../services/order.service';
import { ProductsService } from '../../../services/products.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { fromEvent, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-processing',
  templateUrl: './order-processing.component.html'
})
export class OrderProcessingComponent implements OnInit {
  orderForm: FormGroup;
  loading = false;
  saving = false;
  searchResults: any[] = [];
  selectedProducts: any[] = [];
  availableShippingMethods: any[] = [];
  products: any[] = [];
  customers: any[] = [];
  selectedProduct: any;
  selectedCustomer: any;
  quantity: number = 1;
  total: number = 0;
  subtotal: number = 0;
  tax: number = 0;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private productsService: ProductsService,
    private router: Router,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      customer: this.fb.group({
        id: ['', Validators.required],
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        address: ['', Validators.required]
      }),
      items: this.fb.array([]),
      notes: [''],
      pricing: this.fb.group({
        subtotal: [0],
        tax: [0],
        shipping: [0],
        total: [0]
      })
    });
  }

  ngOnInit(): void {
    this.fetchProductsAndCustomers();
    
    // Subscribe to quantity changes
    this.orderForm.get('quantity')?.valueChanges.subscribe(value => {
      this.quantity = value;
      this.calculateTotal();
    });
  }

  private fetchProductsAndCustomers(): void {
    this.loading = true;
    forkJoin({
      products: this.http.get<any>('http://localhost:3000/api/products'),
      customers: this.http.get<any>('http://0.0.0.0:3000/api/customers/get')
    }).subscribe({
      next: ({ products, customers }) => {
        this.products = products.products;
        this.customers = customers.customers;
        console.log('Loaded products:', this.products);
        console.log('Loaded customers:', this.customers);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(product: any): void {
    const itemGroup = this.fb.group({
      productId: [product._id],
      name: [product.name],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [product.price],
      total: [product.price]
    });

    itemGroup.get('quantity')?.valueChanges.subscribe(qty => {
      const price = itemGroup.get('price')?.value || 0;
      itemGroup.patchValue({ total: qty! * price }, { emitEvent: false });
      this.calculateOrderTotals();
    });

    this.items.push(itemGroup);
    this.calculateOrderTotals();
    this.searchResults = [];
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateOrderTotals();
  }

  private calculateOrderTotals(): void {
    this.subtotal = this.items.controls.reduce((total, control) => 
      total + (control.get('total')?.value || 0), 0);
    this.tax = this.subtotal * 0.1;
    const shipping = this.getShippingCost();
    this.total = this.subtotal + this.tax + shipping;

    this.orderForm.patchValue({
      pricing: {
        subtotal: this.subtotal,
        tax: this.tax,
        shipping: shipping,
        total: this.total
      }
    });
  }

  getShippingCost(): number {
    // You can implement your shipping cost logic here
    return 10; // Default shipping cost
  }

  getSubtotal(): number {
    return this.subtotal;
  }

  getTax(): number {
    return this.tax;
  }

  getTotal(): number {
    return this.total;
  }

  onProductSelect(event: any): void {
    const productId = event.target.value;
    this.selectedProduct = this.products.find(product => product._id === productId);
    if (this.selectedProduct) {
      this.calculateTotal();
      this.addItem(this.selectedProduct);
      console.log('Selected product:', this.selectedProduct);
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

  calculateTotal(): void {
    if (this.selectedProduct && this.quantity) {
      this.total = this.selectedProduct.price * this.quantity;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.orderForm.valid && this.items.length > 0) {
      this.saving = true;

      try {
        const orderData = {
          customerId: this.orderForm.value.customer.id,
          orderItems: this.items.value.map((item: any) => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price
          })),
          deliveryAddress: this.orderForm.value.customer.address,
          totalAmount: this.getTotal(),
          notes: this.orderForm.value.notes
        };

        const order = await this.ordersService.createOrder(orderData).toPromise();
        // this.router.navigate(['/orders/details', order.id]);
      } catch (error) {
        console.error('Error creating order:', error);
      } finally {
        this.saving = false;
      }
    }
  }
}