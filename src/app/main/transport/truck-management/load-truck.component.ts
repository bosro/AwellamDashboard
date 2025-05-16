import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-load-truck',
  templateUrl: './load-truck.component.html',
})
export class LoadTruckComponent implements OnInit {
  loadTruckForm!: FormGroup;
  trucks: any[] = [];
  plants: any[] = [];
  categories: any[] = [];
  products: any[] = [];
  destinations: any[] = [];
  loading = false;
  noCategoriesFound = false;
  noProductsFound = false;
  isLoadOutsideTruckInvoice = true;

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService
  ) {
    this.loadTruckForm = this.fb.group({
      truckId: ['', Validators.required],
      loadedbags: ['', [Validators.required, Validators.min(1)]],
      OutsideSoc: ['', [Validators.required, Validators.pattern(/^SOC\d{9}$/)]],
      plantId: ['', Validators.required],
      // categoryId: ['', Validators.required],
      productId: ['', Validators.required],
      customerName:['', Validators.required],
      amountReceived: ['', Validators.required],
      destinationId: ['', Validators.required] // Add destinationId form control
    });
  }

  ngOnInit(): void {
    this.getTrucks();
    this.getPlants();
  }

  // Fetch all plants
  private getPlants(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/plants/get`).subscribe({
      next: (response) => {
        this.plants = response.plants;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.loading = false;
      },
    });
  }

  // Fetch categories and destinations based on selected plant
  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    if (plantId) {
      this.loading = true;
      


      this.paymentService.getProductByPlant(plantId).subscribe({
        next: (response) => {
          this.products = response.products;
          console.log('Loaded products:', this.products); // Debug log
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
          Swal.fire('Error', 'Failed to load products', 'error');
        }
      });
      // Fetch destinations
      this.http.get<any>(`${this.apiUrl}/destination/${plantId}/get`).subscribe({
        next: (response) => {
          this.destinations = response.destinations;
        },
        error: (error) => console.error('Error loading destinations:', error),
      });
    } else {
      this.categories = [];
      this.noCategoriesFound = false;
      this.loadTruckForm.patchValue({ categoryId: '', productId: '' });
    }
  }

  // Fetch products based on selected category
  // onCategorySelect(event: any): void {
  //   const categoryId = event.target.value;
  //   if (categoryId) {
  //     this.loading = true;
  //     this.noProductsFound = false;
  //     this.http.get<any>(`${this.apiUrl}/products/category/${categoryId}`).subscribe({
  //       next: (response) => {
  //         this.products = response.products;
  //         this.noProductsFound = this.products.length === 0;
  //         this.loadTruckForm.patchValue({ productId: '' }); // Reset product
  //       },
  //       error: (error) => console.error('Error loading products:', error),
  //       complete: () => (this.loading = false),
  //     });
  //   } else {
  //     this.products = [];
  //     this.noProductsFound = false;
  //     this.loadTruckForm.patchValue({ productId: '' });
  //   }
  // }

  onLoadOutsideTruckInvoice(): void {
    this.isLoadOutsideTruckInvoice = true;
  }

  // Fetch all trucks
  private getTrucks(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/trucks/get`).subscribe({
      next: (response) => {
        this.trucks = response.trucks.filter((truck: any) => truck.status === 'inactive');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      },
    });
  }


  goBack(){
    this.router.navigate(['/main/transport/trucks/'])
  }


  
  // Submit the form
  onSubmit(): void {
    if (this.loadTruckForm.valid) {
      this.loading = true;
      const loadTruckData = this.loadTruckForm.value;

      // Submit the form data to the backend
      this.http.post(`${this.apiUrl}/trucks/load`, loadTruckData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Truck Loaded!',
            text: 'The truck has been loaded successfully.',
          });
          this.loadTruckForm.reset();
          this.loading = false;
          this.router.navigate(['/main/transport/trucks']);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'An unexpected error occurred';
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: errorMessage,
          });
          console.error('Error loading truck:', error);
          this.loading = false;
        },
      });
    } else {
      Object.keys(this.loadTruckForm.controls).forEach((key) => {
        const control = this.loadTruckForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  // Get error message for form controls
  getErrorMessage(controlName: string): string {
    const control = this.loadTruckForm.get(controlName);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) {
      return `${this.formatFieldName(controlName)} is required`;
    }

    if (control.errors['min']) {
      return `${this.formatFieldName(controlName)} must be greater than 0`;
    }

    if (control.errors['pattern']) {
      switch (controlName) {
        case 'socNumber':
          return 'Must be in format SOC followed by 9 digits';
        default:
          return 'Invalid format';
      }
    }

    return '';
  }

  // Format field names for error messages
  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  }
}