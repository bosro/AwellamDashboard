import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TruckService } from '../../../services/truck.service';
import { ProductsService } from '../../../services/products.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-truck-detail',
  templateUrl: './truck-detail.component.html'
})
export class TruckDetailComponent implements OnInit {
  truck: any;
  products: any[] = [];
  loading = true;
  showEditForm = false;
  showLoadForm = false;
  editForm: FormGroup;
  loadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private truckService: TruckService,
    private productService: ProductsService,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      truckNumber: [''],
      capacity: [''],
      driver: [''],
      expenses: [''],
      productId: [''],
      socNumber: ['']
    });

    this.loadForm = this.fb.group({
      capacity: [''],
      productId: ['']
    });
  }

  ngOnInit(): void {
    const truckId = this.route.snapshot.paramMap.get('id');
    if (truckId) {
      this.loadTruckDetails(truckId);
    } else {
      console.error('Truck ID is null');
    }
    this.loadProducts();
  }

  loadTruckDetails(truckId: string): void {
    this.truckService.getTruckById(truckId).subscribe({
      next: (response) => {
        this.truck = response.truck;
        this.editForm.patchValue(this.truck);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading truck details:', error);
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts({}).subscribe({
      next: (response) => {
        this.products = response.products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  updateTruck(): void {
    if (this.editForm.valid) {
      this.truckService.updateTruck(this.truck._id, this.editForm.value).subscribe({
        next: () => {
          this.showEditForm = false;
          this.loadTruckDetails(this.truck._id);
        },
        error: (error) => {
          console.error('Error updating truck:', error);
        }
      });
    }
  }


  unloadTruck(truckId: string): void {
    // Show a confirmation dialog before unloading
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will unload the truck. Do you want to proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, unload it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
  
        // Make the HTTP request to unload the truck
        this.truckService.unloadTruck(truckId).subscribe({
          next: () => {
            // Success handling
            Swal.fire({
              icon: 'success',
              title: 'Truck Unloaded!',
              text: 'The truck has been unloaded successfully.',
            });
  
            // Optionally, refresh the truck list or navigate to another page
            this.loading = false;
            this.router.navigate(['/main/transport/trucks']); // Example navigation
          },
          error: (error:any) => {
            // Error handling
            this.loading = false;
  
            // Extract the error message dynamically
            const errorMessage = error.error?.message || 'An unexpected error occurred while unloading the truck.';
  
            // Display the error message in SweetAlert
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: errorMessage,
            });
  
            console.error('Error unloading truck:', error);
          }
        });
      }
    });
  }

  // loadTruck(): void {
  //   if (this.loadForm.valid) {
  //     this.truckService.loadTruck(this.loadForm.value).subscribe({
  //       next: () => {
  //         this.showLoadForm = false;
  //         this.loadTruckDetails(this.truck._id);
  //       },
  //       error: (error) => {
  //         console.error('Error loading truck:', error);
  //       }
  //     });
  //   }
  // }

  loadTruck(): void {
    this.router.navigate(['main/transport/trucks/load']);
  }

  getStatusClass(status: 'active' | 'inactive' | 'maintenance'): string {
    const statusClasses: { [key in 'active' | 'inactive' | 'maintenance']: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}