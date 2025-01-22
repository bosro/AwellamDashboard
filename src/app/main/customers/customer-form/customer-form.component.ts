import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from '../../../services/customer.service';
import { Customer, CustomerStatus, CustomerType } from '../../../shared/types/customer.interface';

interface PaymentMethodOption {
  type: 'credit_card' | 'paypal' | 'bank_account';
  label: string;
}

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  loading = false;
  saving = false;
  currentCustomer?: Customer;
  availableSegments: any[] = [];

  readonly customerTypes = Object.values(CustomerType);
  readonly customerStatuses = Object.values(CustomerStatus);
  readonly paymentMethodOptions: PaymentMethodOption[] = [
    { type: 'credit_card', label: 'Credit Card' },
    { type: 'paypal', label: 'PayPal' },
    { type: 'bank_account', label: 'Bank Account' }
  ];

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.customerForm = this.createCustomerForm();
  }

  ngOnInit(): void {
    this.loadSegments();
    
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.isEditMode = true;
      this.loadCustomer(customerId);
    }
  }

  private createCustomerForm(): FormGroup {
    return this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        dateOfBirth: [''],
        gender: ['']
      }),
      addresses: this.fb.array([]),
      billingInfo: this.fb.group({
        paymentMethods: this.fb.array([])
      }),
      communicationPreferences: this.fb.group({
        email: [true],
        sms: [true],
        phone: [true],
        marketing: [true]
      }),
      accountInfo: this.fb.group({
        status: [CustomerStatus.ACTIVE, Validators.required],
        type: [CustomerType.REGULAR, Validators.required],
        source: ['manual'],
        verified: [false]
      }),
      segments: [[]],
      metadata: this.fb.group({
        tags: [[]],
        loyaltyPoints: [0],
        notes: [[]]
      })
    });
  }

  createAddressFormGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      isDefault: [false],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  createPaymentMethodFormGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      isDefault: [false],
      holderName: ['', Validators.required],
      cardNumber: [''],
      expiryDate: [''],
      cvv: ['']
    });
  }

  get addressesFormArray(): FormArray {
    return this.customerForm.get('addresses') as FormArray;
  }

  get paymentMethodsFormArray(): FormArray {
    return this.customerForm.get('billingInfo.paymentMethods') as FormArray;
  }

  addAddress(): void {
    this.addressesFormArray.push(this.createAddressFormGroup());
  }

  removeAddress(index: number): void {
    this.addressesFormArray.removeAt(index);
  }

  addPaymentMethod(): void {
    this.paymentMethodsFormArray.push(this.createPaymentMethodFormGroup());
  }

  removePaymentMethod(index: number): void {
    this.paymentMethodsFormArray.removeAt(index);
  }

  private loadCustomer(id: string): void {
    this.loading = true;
    this.customersService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.currentCustomer = customer;
        this.patchFormValues(customer);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.loading = false;
      }
    });
  }

  private loadSegments(): void {
    this.customersService.getSegments().subscribe({
      next: (segments) => {
        this.availableSegments = segments;
      },
      error: (error) => console.error('Error loading segments:', error)
    });
  }

  private patchFormValues(customer: Customer): void {
    // Clear existing arrays
    while (this.addressesFormArray.length) {
      this.addressesFormArray.removeAt(0);
    }
    while (this.paymentMethodsFormArray.length) {
      this.paymentMethodsFormArray.removeAt(0);
    }

    // Patch main form values
    this.customerForm.patchValue({
      personalInfo: customer.personalInfo,
      communicationPreferences: customer.communicationPreferences,
      accountInfo: customer.accountInfo,
      segments: customer.segments,
      metadata: {
        tags: customer.metadata.tags,
        loyaltyPoints: customer.metadata.loyaltyPoints
      }
    });

    // Add addresses
    customer.addresses.forEach(address => {
      this.addressesFormArray.push(this.fb.group(address));
    });

    // Add payment methods
    customer.billingInfo.paymentMethods.forEach(method => {
      this.paymentMethodsFormArray.push(this.fb.group(method));
    });
  }

  async onSubmit(): Promise<void> {
    if (this.customerForm.valid) {
      this.saving = true;

      try {
        const formData = this.customerForm.value;
        
        if (this.isEditMode && this.currentCustomer) {
          await this.customersService.updateCustomer(
            this.currentCustomer.id, 
            formData
          ).toPromise();
        } else {
          await this.customersService.createCustomer(formData).toPromise();
        }

        this.router.navigate(['/customers/list']);
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
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  getFieldError(path: string): string {
    const control = this.customerForm.get(path);
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
    }
    return '';
  }
}