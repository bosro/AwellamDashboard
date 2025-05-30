import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomersService } from '../../../services/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlantService } from '../../../services/plant.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  isEditMode = false;
  loading = false;
  saving = false;
  currentCustomer: any;
  plants: any[] = []; // Adjust type as necessary
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: CustomersService,
    private snackBar: MatSnackBar,
      private plantService: PlantService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.loadPlants();
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', Validators.required],
        address: ['', Validators.required],
        email: ['', ],
        phoneNumber: ['', Validators.required],
        balance:['', Validators.required],
        plantId: ['', Validators.required]
      })
    });
  }

  showSnackBar(message: string, isError = false) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private checkEditMode(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.isEditMode = true;
      this.loadCustomer(customerId);
    }
  }

    private loadPlants(): void {
      this.loading = true;
      this.plantService.getPlants()
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            this.plants = response.plants;
          },
          error: (error) => console.error('Error loading plants:', error)
        });
    }

  private loadCustomer(id: string): void {
    this.loading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (response) => {
        const customer = response.customer; // Adjust this line based on the actual API response structure
        this.currentCustomer = customer;
        this.customerForm.patchValue({
          personalInfo: {
            fullName: customer.fullName,
            address: customer.address,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            balance:customer.balance,
            plantId: customer.plantId // Assuming plantId is an object with _id
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.loading = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.customerForm.valid) {
      this.saving = true;
      const formData = this.customerForm.value.personalInfo;

      try {
        if (this.isEditMode) {
          await this.customerService.updateCustomer(this.currentCustomer._id, formData).toPromise();
          this.showSnackBar('Customer added successfully');
        } else {
          await this.customerService.createCustomer(formData).toPromise();
          this.showSnackBar('Customer updated successfully');
        }
        this.router.navigate(['/main/customers/list']);
        this.showSnackBar('Customer added successfully');
      } catch (error:any) {
        console.error('Error saving customer:', error);
        this.showSnackBar(error, true);
      } finally {
        this.saving = false;
      }
    } else {
      this.markFormGroupTouched(this.customerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control instanceof FormGroup ? 
        this.markFormGroupTouched(control) : 
        control.markAsTouched();
    });
  }

  getFieldError(path: string): string {
    const control = this.customerForm.get(path);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      // if (control.errors['email']) return 'Please enter a valid email address';
    }
    return '';
  }

  onCancel(): void {
    this.router.navigate(['/main/customers/list']);
  }

  onBack(): void {
    this.router.navigate(['/main/customers/list']);
  }
}