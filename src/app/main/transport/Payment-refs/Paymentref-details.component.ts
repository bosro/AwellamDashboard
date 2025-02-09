import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

// Services
import { PaymentService } from '../../../services/payment.service';
import { TruckService } from '../../../services/truck.service';
import { PlantService } from '../../../services/plant.service';

// Types
import { PaymentReference, Plant, Product, SocNumber } from '../../../services/payment.service';
import { Truck } from '../../../shared/types/truck-operation.types';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './Payment-detail.html',
})
export class PaymentDetailComponent implements OnInit {
  paymentRef: PaymentReference | null = null;
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  plants: Plant[] = [];
  products: Product[] = [];
  destinations: any[] = [];
  socForm: FormGroup;
  formSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private truckService: TruckService,
    private plantService: PlantService
  ) {
    this.socForm = this.fb.group({
      socNumber: ['', [Validators.required, Validators.minLength(5)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      plantId: ['', Validators.required],
      productId: ['', Validators.required],
      destinationId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPaymentDetails(id);
      this.loadPlants();
    } else {
      this.router.navigate(['/payments']);
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
      },
    });
  }

  loadPlants(): void {
    this.loading = true;
    this.paymentService.getPlants().subscribe({
      next: (response) => {
        this.plants = response.plants;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.error = 'Failed to load plants';
        this.loading = false;
        Swal.fire('Error', 'Failed to load plants', 'error');
      },
    });
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    if (plantId) {
      this.loading = true;

      // Load destinations
      this.plantService
        .getDestinationsByPlant(plantId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (response) => {
            this.destinations = response.destinations;
          },
          error: (error) => {
            console.error('Error loading destinations:', error);
            Swal.fire('Error', 'Failed to load destinations', 'error');
          },
        });

      // Load products
      this.paymentService.getProductByPlant(plantId).subscribe({
        next: (response) => {
          this.products = response.products;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          Swal.fire('Error', 'Failed to load products', 'error');
        },
      });
    } else {
      this.destinations = [];
      this.products = [];
      this.socForm.patchValue({
        destinationId: '',
        productId: '',
      });
    }
  }

  onSubmitSoc(): void {
    if (this.socForm.valid && this.paymentRef) {
      this.formSubmitting = true;

      const socData = {
        ...this.socForm.value,
        quantity: Number(this.socForm.value.quantity),
        price: Number(this.socForm.value.price),
      };

      this.paymentService.createSoc(this.paymentRef._id, socData).subscribe({
        next: () => {
          Swal.fire({
            title: 'Success',
            text: 'SOC created successfully',
            icon: 'success',
            timer: 2000,
          });
          this.loadPaymentDetails(this.paymentRef!._id);
          this.showCreateForm = false;
          this.socForm.reset();
          this.formSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating SOC:', error.error?.message);
          Swal.fire('Error', error.error?.message, 'error');
          this.formSubmitting = false;
        },
      });
    } else {
      Object.keys(this.socForm.controls).forEach((key) => {
        const control = this.socForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  getActiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter((soc:any) => soc.status === 'active') || [];
  }

  getInactiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter((soc:any) => soc.status === 'inactive') || [];
  }

  async assignDriver(socId: string): Promise<void> {
    try {
      const trucks = await this.loadAvailableTrucks();
      if (trucks.length === 0) {
        Swal.fire('Warning', 'No available trucks found', 'warning');
        return;
      }

      const truckOptions = trucks.reduce((acc, truck) => {
        acc[truck._id] = `${truck.truckNumber} ${truck.driver ? `(Driver: ${truck.driver.name})` : ''}`;
        return acc;
      }, {} as { [key: string]: string });

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
          return this.truckService
            .assignSocToTruck(truckId, socId)
            .toPromise()
            .catch((error) => {
              const errorMessage = error.error?.message || 'Assignment failed';
              Swal.showValidationMessage(`Assignment failed: ${errorMessage}`);
            });
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (isConfirmed) {
        await Swal.fire({
          title: 'Success!',
          text: 'Truck assigned successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        this.loadPaymentDetails(this.paymentRef!._id);
      }
    } catch (error) {
      console.error('Error in truck assignment:', error);
      Swal.fire('Error', 'Failed to complete truck assignment', 'error');
    }
  }

  async loadAvailableTrucks(): Promise<Truck[]> {
    try {
      const response = await this.truckService.getInactiveTrucks().toPromise();
      if (response) {
        return response.trucks.filter((truck: Truck) => truck.status === 'inactive');
      } else {
        throw new Error('Failed to load trucks');
      }
    } catch (error) {
      console.error('Error loading trucks:', error);
      throw error;
    }
  }
}