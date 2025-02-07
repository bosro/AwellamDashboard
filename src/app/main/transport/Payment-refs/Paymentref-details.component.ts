import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, SocNumber } from '../../../services/payment.service';
import { PaymentReference, Plant, Category, Product } from '../../../services/payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

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
  socForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) {
    this.socForm = this.fb.group({
      socNumber: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      plantId: ['', Validators.required],
      categoryId: ['', Validators.required],
      productId: ['', Validators.required],
      orderType: ['', Validators.required]
    });
  }

  // ngOnInit(): void {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (id) {
  //     this.loadPaymentDetails(id);
  //     this.loadPlants();
  //   } else {
  //     this.router.navigate(['/payments']);
  //   }
  // }

  loadPlants(): void {
    this.paymentService.getPlants().subscribe({
      next: (response) => this.plants = response.plants,
      error: (error) => console.error('Error loading plants:', error)
    });
  }

 

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    if (plantId) {
      this.paymentService.getCategoriesByPlant(plantId).subscribe({
        next: (response) => {
          this.categories = response.categories;
          this.socForm.patchValue({ categoryId: '', productId: '' });
        },
        error: (error) => console.error('Error loading categories:', error)
      });
    }
  }

  onCategorySelect(event: any): void {
    const categoryId = event.target.value;
    if (categoryId) {
      this.paymentService.getProductsByCategory(categoryId).subscribe({
        next: (response) => {
          this.products = response.products;
          this.socForm.patchValue({ productId: '' });
        },
        error: (error) => console.error('Error loading products:', error)
      });
    }
  }

  async assignDriver(socId: string): Promise<void> {
    // First, load available drivers
    try {
      // const { drivers } = await this.driverService.getAvailableDrivers().toPromise();
      
      const { value: selectedDriverId } = await Swal.fire({
        title: 'Select Driver',
        input: 'select',
        // inputOptions: Object.fromEntries(
        //   // drivers.map(driver => [driver._id, `${driver.name} (${driver.truckNumber})`])
        // ),
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (!value) {
              resolve('You need to select a driver');
            } else {
              resolve(null);
            }
          });
        }
      });

      // if (selectedDriverId) {
      //   this.socService.assignSocToDriver(selectedDriverId, socId).subscribe({
      //     next: (response) => {
      //       Swal.fire('Success', 'Driver assigned successfully', 'success');
      //       this.loadPaymentDetails(this.paymentRef!._id);
      //     },
      //     error: (error) => {
      //       Swal.fire('Error', 'Failed to assign driver', 'error');
      //       console.error('Error assigning driver:', error);
      //     }
      //   });
      // }
    } catch (error) {
      console.error('Error loading drivers:', error);
      Swal.fire('Error', 'Failed to load available drivers', 'error');
    }
  }

  onSubmitSoc(): void {
    if (this.socForm.valid && this.paymentRef) {
      this.paymentService.createSoc(this.paymentRef._id, this.socForm.value).subscribe({
        next: () => {
          Swal.fire('Success', 'SOC created successfully', 'success');
          this.loadPaymentDetails(this.paymentRef!._id);
          this.showCreateForm = false;
          this.socForm.reset();
        },
        error: (error) => {
          Swal.fire('Error', 'Failed to create SOC', 'error');
          console.error('Error creating SOC:', error);
        }
      });
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPaymentDetails(id);
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
      }
    });
  }

  getActiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter(soc => soc.status === 'active') || [];
  }

  getInactiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter(soc => soc.status === 'inactive') || [];
  }
}