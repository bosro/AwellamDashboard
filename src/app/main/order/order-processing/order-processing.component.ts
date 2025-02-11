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
  filterForm!: FormGroup;
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
    this.orderForm = this.fb.group({
      plant: ['', Validators.required],

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

    this.filterForm = this.fb.group({
      search: this.fb.control('') // Explicitly define as FormControl
    });
  }

  get searchControl(): FormControl {
    return this.filterForm.get('search') as FormControl;
  }

  ngOnInit(): void {
    this.fetchPlantsAndCustomers();
    // this.setupFilters();
    this.loadCustomers();
    this.onPlantSelect({ target: { value: this.orderForm.get('plant')?.value } });

    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterCustomers(searchTerm);
      });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged() // Only trigger if the search term changes
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private fetchPlantsAndCustomers(): void {
    this.loading = true;
    forkJoin({
      plants: this.http.get<any>(`${this.apiUrl}/plants/get`)
    }).subscribe({
      next: ({ plants }) => {
        this.plants = plants.plants;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => this.loading = false
    });
  }

  applyFilters(): void {
    const { search } = this.filterForm.value;
    this.filteredCustomers = this.customers.filter(customer =>
      !search || customer.fullName.toLowerCase().includes(search.toLowerCase())
    );
    this.total = this.filteredCustomers.length;
  }

  loadCustomers(): void {
    this.loading = true;
    this.customersService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.customers || [];
        this.total = response.total || this.customers.length; // Ensure total is set properly
        this.applyFilters();
        this.loading = false;
        console.log(this.customers);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const searchValue = this.filterForm.get('search')?.value.toLowerCase();
    this.filteredCustomers = this.customers.filter(customer =>
      customer.fullName.toLowerCase().includes(searchValue) ||
      customer.phoneNumber.includes(searchValue)
    );
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
        },
      });
    } else {
      this.categories = [];
      this.noCategoriesFound = false;
      this.orderForm.patchValue({ category: '', product: '' });
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


  filterCustomers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredCustomers = this.customers; // Show all customers if no search term
    } else {
      this.filteredCustomers = this.customers.filter(customer =>
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm)
      );
    }
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

  // onCustomerSelect(customer: any): void {
  //   this.selectedCustomer = customer;
  //   if (this.selectedCustomer) {
  //     this.orderForm.patchValue({
  //       customer: {
  //         id: this.selectedCustomer._id,
  //         name: this.selectedCustomer.fullName,
  //         email: this.selectedCustomer.email,
  //         phone: this.selectedCustomer.phoneNumber,
  //         address: this.selectedCustomer.address
  //       }
  //     });
  //   }
  // }

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
    this.filterForm.get('search')?.setValue(''); // Clear search input after selection
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
        plantId: this.orderForm.value.plant,
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