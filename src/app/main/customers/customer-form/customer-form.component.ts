import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from '../../../services/customer.service';
import { Customer } from '../../../shared/types/customer.interface';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent implements OnInit {
  customer?: Customer;
  customerForm: FormGroup;
  isEditMode = false;
  loading = false;
  saving = false;
  currentCustomer: any;

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.customerForm = this.createCustomerForm();
  }

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.isEditMode = true;
      this.loadCustomer(customerId);
    }
  }

  private createCustomerForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  private loadCustomer(id: string): void {
    this.loading = true;
    this.customersService.getCustomerById(id).subscribe({
      next: (response) => {
        this.customer = response.customer; // Access the customer property from the response
        // this.loadCustomerData();
        this.loading = false;
        console.log(this.customer);
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

      try {
        const formData = this.customerForm.value;

        if (this.isEditMode && this.currentCustomer) {
          await this.customersService
            .updateCustomer(this.currentCustomer._id, formData)
            .toPromise();
        } else {
          await this.customersService.createCustomer(formData).toPromise();
        }

        this.router.navigate(['main/customers/list']);
      } catch (error) {
        console.error('Error saving customer:', error);
        // Handle error (show error message to user)
      } finally {
        this.saving = false;
      }
    } else {
      this.markFormGroupTouched(this.customerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  getFieldError(field: string): string {
    const control = this.customerForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return 'Invalid phone number';
      }
    }
    return '';
  }
}
