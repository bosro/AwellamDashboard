// src/app/components/payment-detail/payment-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, SocNumber } from '../../../services/payment.service';
import { PaymentReference, Plant, Category, Product } from '../../../services/payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { TruckService } from '../../../services/truck.service';
import { Truck ,TruckResponse} from '../../../shared/types/truck-operation.types';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './Payment-detail.html'
})
export class PaymentDetailComponent implements OnInit {
  paymentRef: PaymentReference | null = null;
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  plants: Plant[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  socForm!: FormGroup;
  formSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private truckService: TruckService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.socForm = this.fb.group({
      socNumber: ['', [Validators.required, Validators.minLength(5)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      plantId: ['', Validators.required],
      categoryId: ['', Validators.required],
      productId: ['', Validators.required],
      orderType: ['', Validators.required]
    });

    // Subscribe to plantId changes
    this.socForm.get('plantId')?.valueChanges.subscribe(plantId => {
      if (plantId) {
        this.loadCategories(plantId);
      } else {
        this.categories = [];
        this.products = [];
        this.socForm.patchValue({
          categoryId: '',
          productId: ''
        }, { emitEvent: false });
      }
    });

    // Subscribe to categoryId changes
    this.socForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.loadProducts(categoryId);
      } else {
        this.products = [];
        this.socForm.patchValue({
          productId: ''
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPaymentDetails(id);
      this.loadPlants(); // Load plants on initialization
    } else {
      this.router.navigate(['/payments']);
    }
  }

  loadPlants(): void {
    this.loading = true;
    this.paymentService.getPlants().subscribe({
      next: (response) => {
        this.plants = response.plants;
        this.loading = false;
        console.log('Plants loaded:', this.plants); // Debug log
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.error = 'Failed to load plants';
        this.loading = false;
        Swal.fire('Error', 'Failed to load plants', 'error');
      }
    });
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    console.log('Selected Plant ID:', plantId); // Debug log
    
    if (plantId) {
      this.loading = true;
      this.paymentService.getCategoriesByPlant(plantId).subscribe({
        next: (response) => {
          this.categories = response.categories;
          console.log('Loaded categories:', this.categories); // Debug log
          // Reset dependent fields
          this.socForm.patchValue({
            categoryId: '',
            productId: ''
          });
          this.products = []; // Clear products array
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.loading = false;
          Swal.fire('Error', 'Failed to load categories', 'error');
        }
      });
    } else {
      // Reset dependent fields if no plant is selected
      this.categories = [];
      this.products = [];
      this.socForm.patchValue({
        categoryId: '',
        productId: ''
      });
    }
  }

  onCategorySelect(event: any): void {
    const categoryId = event.target.value;
    console.log('Selected Category ID:', categoryId); // Debug log

    if (categoryId) {
      this.loading = true;
      this.paymentService.getProductsByCategory(categoryId).subscribe({
        next: (response) => {
          this.products = response.products;
          console.log('Loaded products:', this.products); // Debug log
          // Reset product selection
          this.socForm.patchValue({
            productId: ''
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
          Swal.fire('Error', 'Failed to load products', 'error');
        }
      });
    } else {
      // Reset product if no category is selected
      this.products = [];
      this.socForm.patchValue({
        productId: ''
      });
    }
  }

  loadCategories(plantId: string): void {
    this.loading = true;
    this.paymentService.getCategoriesByPlant(plantId).subscribe({
      next: (response) => {
        this.categories = response.categories;
        this.loading = false;
        console.log('Categories loaded:', this.categories); // Debug log
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
        this.loading = false;
        Swal.fire('Error', 'Failed to load categories', 'error');
      }
    });
  }

  loadProducts(categoryId: string): void {
    this.loading = true;
    this.paymentService.getProductsByCategory(categoryId).subscribe({
      next: (response) => {
        this.products = response.products;
        this.loading = false;
        console.log('Products loaded:', this.products); // Debug log
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.loading = false;
        Swal.fire('Error', 'Failed to load products', 'error');
      }
    });
  }

  onSubmitSoc(): void {
    if (this.socForm.valid && this.paymentRef) {
      this.formSubmitting = true;

      const socData = {
        ...this.socForm.value,
        quantity: Number(this.socForm.value.quantity)
      };

      this.paymentService.createSoc(this.paymentRef._id, socData).subscribe({
        next: () => {
          Swal.fire({
            title: 'Success',
            text: 'SOC created successfully',
            icon: 'success',
            timer: 2000
          });
          this.loadPaymentDetails(this.paymentRef!._id);
          this.showCreateForm = false;
          this.socForm.reset();
          this.formSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating SOC:', error);
          Swal.fire('Error', 'Failed to create SOC', 'error');
          this.formSubmitting = false;
        }
      });
    } else {
      // Show validation errors
      Object.keys(this.socForm.controls).forEach(key => {
        const control = this.socForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  loadPaymentDetails(id: string): void {
    this.loading = true;
    this.error = null;

    this.paymentService.getPaymentReferenceDetails(id).subscribe({
      next: (response) => {
        this.paymentRef = response.paymentReference;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load payment reference details';
        this.loading = false;
        console.error('Error loading payment details:', error);
        Swal.fire('Error', 'Failed to load payment details', 'error');
      }
    });
  }

  getActiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter(soc => soc.status === 'active') || [];
  }

  getInactiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter(soc => soc.status === 'inactive') || [];
  }

  async loadAvailableTrucks(): Promise<Truck[]> {
    try {
      const response = await this.truckService.getInactiveTrucks().toPromise();
      if (response) {
        // Filter trucks with status 'inactive'
        return response.trucks.filter((truck: Truck) => truck.status === 'inactive');
      } else {
        throw new Error('Failed to load trucks');
      }
    } catch (error) {
      console.error('Error loading trucks:', error);
      throw error;
    }
  }

  async assignDriver(socId: string): Promise<void> {
    try {
      // First load available trucks
      const trucks = await this.loadAvailableTrucks();
      
      if (trucks.length === 0) {
        Swal.fire('Warning', 'No available trucks found', 'warning');
        return;
      }

      // Create truck selection options
      const truckOptions = trucks.reduce((acc, truck) => {
        acc[truck._id] = `${truck.truckNumber} ${truck.driver ? `(Driver: ${truck.driver.name})` : ''}`;
        return acc;
      }, {} as { [key: string]: string });

      // Show truck selection dialog
      const { value: selectedTruckId, isConfirmed } = await Swal.fire({
        title: 'Select Truck',
        input: 'select',
        inputOptions: truckOptions,
        inputPlaceholder: 'Select a truck',
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (!value) {
              resolve('You need to select a truck');
            } else {
              resolve(null);
            }
          });
        },
        confirmButtonText: 'Assign',
        cancelButtonText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: (truckId) => {
          return this.truckService.assignSocToTruck(truckId, socId)
            .toPromise()
            .catch(error => {
              const errorMessage = error.error?.message || 'Assignment failed';
              Swal.showValidationMessage(
                `Assignment failed: ${errorMessage}`
              );
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
      });

      if (isConfirmed) {
        await Swal.fire({
          title: 'Success!',
          text: 'Truck assigned successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Reload payment details to refresh the SOC list
        this.loadPaymentDetails(this.paymentRef!._id);
      }

    } catch (error) {
      console.error('Error in truck assignment:', error);
      Swal.fire('Error', 'Failed to complete truck assignment', 'error');
    }
  }
}
