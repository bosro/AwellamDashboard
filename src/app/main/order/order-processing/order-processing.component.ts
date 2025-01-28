import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../../../services/order.service';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// import 

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
  selectedProduct: any;
  selectedCustomer: any;
  quantity: number = 1;
  total: number = 0;
  subtotal: number = 0;
  tax: number = 0;

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
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
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.fetchProductsAndCustomers();
    
    this.orderForm.get('quantity')?.valueChanges.subscribe(value => {
      this.quantity = value;
      this.calculateTotal();
    });
  }

  private fetchProductsAndCustomers(): void {
    this.loading = true;
    forkJoin({
      products: this.http.get<any>(`${this.apiUrl}/products/get`),
      customers: this.http.get<any>(`${this.apiUrl}/customers/get`)
    }).subscribe({
      next: ({ products, customers }) => {
        this.products = products.products;
        this.customers = customers.customers;
      },
      error: (error) => console.error('Error fetching data:', error),
      complete: () => this.loading = false
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
      itemGroup.patchValue({ total: (qty || 0) * price }, { emitEvent: false });
      this.calculateOrderTotals();
    });

    this.items.push(itemGroup);
    this.calculateOrderTotals();
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateOrderTotals();
  }

  private calculateOrderTotals(): void {
    this.subtotal = this.items.controls.reduce((total, control) => 
      total + (control.get('total')?.value || 0), 0);
    this.tax = this.subtotal * 0.1;
    // this.total = this.subtotal + this.tax + this.getShippingCost();
  }

  // getShippingCost(): number {
  //   return 10;
  // }

  // getSubtotal(): number {
  //   return this.subtotal;
  // }

  // getTax(): number {
  //   return this.tax;
  // }

  getTotal(): number {
    return this.total;
  }

  onProductSelect(event: any): void {
    const productId = event.target.value;
    this.selectedProduct = this.products.find(product => product._id === productId);
    if (this.selectedProduct) {
      this.calculateTotal();
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

  calculateTotal(): void {
    if (this.selectedProduct && this.quantity) {
      this.total = this.selectedProduct.price * this.quantity;
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
          price: item.price
        })),
        deliveryAddress: this.orderForm.value.customer.address,
        totalAmount: this.getTotal()
      };

      this.ordersService.createOrder(orderData).subscribe({
        next: () => {
          this.router.navigate(['main/orders/list']);
          this.saving = false;
        },
        error: (error:any) => {
          console.error('Error creating order:', error);
          this.saving = false;
        }
      });
    }
  }
}