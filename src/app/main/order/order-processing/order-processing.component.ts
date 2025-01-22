import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../../../services/order.service';
import { ProductsService } from '../../../services/products.service';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { forkJoin, fromEvent } from 'rxjs';

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
  paymentMethods = [
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'bank_transfer', name: 'Bank Transfer' }
  ];

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private productsService: ProductsService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      customer: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required]
      }),
      billing: this.fb.group({
        address: this.fb.group({
          line1: ['', Validators.required],
          line2: [''],
          city: ['', Validators.required],
          state: ['', Validators.required],
          postalCode: ['', Validators.required],
          country: ['', Validators.required]
        }),
        paymentMethod: ['', Validators.required]
      }),
      shipping: this.fb.group({
        sameAsBilling: [true],
        address: this.fb.group({
          line1: [''],
          line2: [''],
          city: [''],
          state: [''],
          postalCode: [''],
          country: ['']
        }),
        method: ['', Validators.required]
      }),
      items: this.fb.array([]),
      notes: [''],
      source: ['website']
    });

    // Handle same as billing checkbox
    this.orderForm.get('shipping.sameAsBilling')?.valueChanges
      .subscribe(sameAsBilling => {
        if (sameAsBilling) {
          this.copyBillingAddress();
        }
      });
  }

  ngOnInit(): void {
    this.setupProductSearch();
  }

  private setupProductSearch(): void {
    // Implement product search with debounce
    const searchInput = document.getElementById('product-search') as HTMLInputElement;
    fromEvent(searchInput, 'input').pipe(
      map((e: Event) => (e.target as HTMLInputElement).value),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.productsService.searchProducts(term))
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(product: any): void {
    const itemGroup = this.fb.group({
      productId: [product.id],
      sku: [product.sku],
      name: [product.name],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [product.price.base],
      total: [product.price.base]
    });

    // Update total when quantity changes
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
    let subtotal = 0;
    this.items.controls.forEach(control => {
      subtotal += control.get('total')?.value || 0;
    });

    // Update form with totals
    this.orderForm.patchValue({
      pricing: {
        subtotal,
        tax: subtotal * 0.1, // Example tax calculation
        shipping: this.getShippingCost(),
        total: subtotal + (subtotal * 0.1) + this.getShippingCost()
      }
    });
  }

  getShippingCost(): number {
    const method = this.orderForm.get('shipping.method')?.value;
    const rates = this.availableShippingMethods.find(m => m.id === method);
    return rates?.cost || 0;
  }
  private copyBillingAddress(): void {
    const billingAddress = this.orderForm.get('billing.address')?.value;
    this.orderForm.get('shipping.address')?.patchValue(billingAddress);
  }

  validateAddress(type: 'billing' | 'shipping'): void {
    const address = this.orderForm.get(`${type}.address`)?.value;
    this.ordersService.validateAddress(address).subscribe({
      next: (validatedAddress) => {
        this.orderForm.get(`${type}.address`)?.patchValue(validatedAddress);
      },
      error: (error) => console.error('Error validating address:', error)
    });
  }

  calculateShippingRates(): void {
    const orderData = {
      items: this.items.value,
      address: this.orderForm.get('shipping.address')?.value
    };

    this.ordersService.getShippingRates(orderData).subscribe({
      next: (rates) => {
        this.availableShippingMethods = rates;
      },
      error: (error) => console.error('Error calculating shipping rates:', error)
    });
  }

  async onSubmit(): Promise<void> {
    if (this.orderForm.valid) {
      this.saving = true;

      try {
        // Process payment first
        const paymentResult = await this.processPayment();
        
        // Create order with payment information
        const orderData = {
          ...this.orderForm.value,
          billing: {
            ...this.orderForm.value.billing,
            transactionId: paymentResult.transactionId
          }
        };

        const order = await this.ordersService.createOrder(orderData).toPromise();
        this.router.navigate(['/orders/details', order.id]);
      } catch (error) {
        console.error('Error creating order:', error);
        // Handle error (show error message to user)
      } finally {
        this.saving = false;
      }
    }
  }

  private async processPayment(): Promise<any> {
    // Implement payment processing logic
    return new Promise((resolve) => {
      // Simulated payment processing
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `TR${Date.now()}`
        });
      }, 1000);
    });
  }

 

  getSubtotal(): number {
    let subtotal = 0;
    this.items.controls.forEach(control => {
      subtotal += control.get('total')?.value || 0;
    });
    return subtotal;
  }

  getTax(): number {
    return this.getSubtotal() * 0.1; // 10% tax rate
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax() + this.getShippingCost();
  }
}