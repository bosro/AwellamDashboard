import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-load-truck',
  templateUrl: './load-truck.component.html',
//   styleUrls: ['./load-truck.component.css']
})
export class LoadTruckComponent implements OnInit {
  loadTruckForm!: FormGroup;
  trucks: any[] = [];
  products: any[] = [];
  loading = false;

  private apiUrl= `${environment.apiUrl}`

  constructor(
    private fb: FormBuilder,
    private router : Router,
    private http: HttpClient
  ) {
    this.loadTruckForm = this.fb.group({
      truckId: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      socNumber: ['', [Validators.required, Validators.pattern(/^SOC\d{9}$/)]],
      product: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getTrucks();
    this.getProducts();
  }

  private getTrucks(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/trucks/get`).subscribe({
      next: (response) => {
        this.trucks = response.trucks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      }
    });
  }

  private getProducts(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/products/get`).subscribe({
      next: (response) => {
        this.products = response.products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.loadTruckForm.valid) {
      this.loading = true;
      const loadTruckData = this.loadTruckForm.value;

      // Submit the form data to the backend
      this.http.put(`${this.apiUrl}/trucks/load`, loadTruckData).subscribe({
        next: () => {
          alert('Truck loaded successfully');
          this.loadTruckForm.reset();
          this.loading = false;
          this.router.navigate(['/main/transport/trucks']);
        },
        error: (error) => {
          console.error('Error loading truck:', error);
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.loadTruckForm.controls).forEach(key => {
        const control = this.loadTruckForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

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

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  }
}