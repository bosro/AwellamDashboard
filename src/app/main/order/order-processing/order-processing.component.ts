import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../../../services/order.service';
import { forkJoin, combineLatest, debounceTime, distinctUntilChanged } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaymentService } from '../../../services/payment.service';
import Swal from 'sweetalert2';
import { CustomersService } from '../../../services/customer.service';
import { Customer } from '../../../shared/types/customer.interface';

@Component({
  selector: 'app-order-processing',
  templateUrl: './order-processing.component.html'
})
export class OrderProcessingComponent implements OnInit {
  orderForm: FormGroup;
  filterForm: FormGroup;
  
  loading = false;
  saving = false;
  products: any[] = [];
  customers: any[] = [];
  plants: any[] = [];
  selectedProduct: any;
  selectedCustomer: any;
  noProductsFound = false;
  filteredCustomers: Customer[] = [];

  private apiUrl = `${environment.apiUrl}`;
  total!: number;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private router: Router,
    private http: HttpClient,
    private paymentService: PaymentService,
    private customersService: CustomersService
  ) {
    // Initialize main order form
    this.orderForm = this.fb.group({
      plantId: ['', Validators.required],
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

    // Initialize filter form
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  // Getter for search control
  get searchControl(): FormControl {
    return this.filterForm.get('search') as FormControl;
  }

  // Getter for items form array
  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.fetchPlantsAndCustomers();
    this.loadCustomers();
    this.onPlantSelect({ target: { value: this.orderForm.get('plant')?.value } });

    // Setup search filter subscription
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        console.log('Search term changed:', searchTerm);
        this.filterCustomers(searchTerm);
      });
  }

  private fetchPlantsAndCustomers(): void {
    this.loading = true;
    forkJoin({
      plants: this.http.get<any>(`${this.apiUrl}/plants/get`)
    }).subscribe({
      next: ({ plants }) => {
        this.plants = plants.plants;
        console.log('Loaded plants:', this.plants.length);
      },
      error: (error) => {
        console.error('Error fetching plants:', error);
        Swal.fire('Error', 'Failed to load plants', 'error');
      },
      complete: () => this.loading = false
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.customersService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.customers || [];
        this.filteredCustomers = [];
        this.total = response.total || this.customers.length;
        // Add this debug log
        // console.log('Sample customer:', this.customers[0]);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
        Swal.fire('Error', 'Failed to load customers', 'error');
      }
    });
  }
  
  private filterCustomers(searchTerm: string): void {
    console.log('Filtering customers with:', searchTerm);
    
    if (!searchTerm?.trim()) {
      this.filteredCustomers = [];
    } else {
      searchTerm = searchTerm.toLowerCase().trim();
      this.filteredCustomers = this.customers.filter(customer => {
        const nameMatch = customer.fullName?.toLowerCase().includes(searchTerm);
        const phoneMatch = customer.phoneNumber?.toString().includes(searchTerm);
        return nameMatch || phoneMatch;
      });
    }
    console.log('Filtered customers:', this.filteredCustomers.length);
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    if (plantId) {
      this.loading = true;
      this.paymentService.getProductByPlant(plantId).subscribe({
        next: (response) => {
          this.products = response.products;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          Swal.fire('Error', 'Failed to load products', 'error');
          this.loading = false;
        }
      });
    } else {
      this.products = [];
      this.noProductsFound = false;
      this.orderForm.patchValue({ product: '' });
    }
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

    // Subscribe to quantity and price changes
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

  onCustomerSelect(customer: any): void {
    this.selectedCustomer = customer;
    this.orderForm.patchValue({
      customer: {
        id: this.selectedCustomer._id,
        name: this.selectedCustomer.fullName,
        email: this.selectedCustomer.email,
        phone: this.selectedCustomer.phoneNumber,
        address: this.selectedCustomer.address
      }
    });
    this.searchControl.setValue('', { emitEvent: false }); // Clear search without triggering filter
    this.filteredCustomers = []; // Clear filtered results
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
        totalAmount: this.getTotal(),
        notes: this.orderForm.value.notes,
        plantId: this.orderForm.value.plantId,
      };

      this.ordersService.createOrder(orderData).subscribe({
        next: () => {
          Swal.fire('Success', 'Order created successfully', 'success');
          this.router.navigate(['main/orders/list']);
        },
        error: (error) => {
          console.error('Error creating order:', error);
          Swal.fire('Error', 'Failed to create order', 'error');
          this.saving = false;
        }
      });
    }
  }
}