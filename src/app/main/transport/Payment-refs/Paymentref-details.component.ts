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
  socForm!: FormGroup;
  editSocForm!: FormGroup;
  formSubmitting = false;
  selectedSoc: SocNumber | null = null;
  viewModalVisible = false;
  editModalVisible = false;
  borrowedVisible = false;
  statuses = ['active', 'inactive'];
  
  // New properties for multiple SOC assignment
  selectedSocs: string[] = [];
  bulkAssignModalVisible = false;
  allSocs: any[] = []; // Store all SOCs from the system
  bulkAssignLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private truckService: TruckService,
    private plantService: PlantService
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    // Initialize create form
    this.socForm = this.fb.group({
      socNumber: ['', [
        Validators.required, 
        Validators.minLength(12), 
        Validators.maxLength(12),
        Validators.pattern(/^SOC\d{9}$/)
      ]],
      quantity: ['', ],
      plantId: ['', Validators.required],
      productId: ['', Validators.required],
      destinationId: ['', Validators.required],
    });

    // Initialize edit form
    this.editSocForm = this.fb.group({
      socNumber: ['', [
        Validators.required, 
        Validators.minLength(12), 
        Validators.maxLength(12),
        Validators.pattern(/^SOC\d{9}$/)
      ]],
      
      quantity: ['', ],
      plantId: ['', Validators.required],
      productId: ['', Validators.required],
      destinationId: ['', Validators.required],
      status : ['',Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPaymentDetails(id);
      this.loadPlants();
      this.loadAllSocs(); // Load all SOCs from the system
    } else {
      this.router.navigate(['/payments']);
    }
  }

  bulkAssignFromCurrent(): void {
    if (this.selectedSocs.length === 0) {
      Swal.fire('Warning', 'Please select at least one SOC to assign', 'warning');
      return;
    }
    this.showCurrentSocsModal = true;
  }
  
  closeCurrentSocsModal(): void {
    this.showCurrentSocsModal = false;
  }
  
  // // Helper method to get SOC number by ID
  // getSocNumberById(socId: string): string {
  //   // First check in local active SOCs
  //   const localSoc = this.getActiveSocs().find(soc => soc._id === socId);
  //   if (localSoc) return localSoc.socNumber;
    
  //   // Then check in global SOCs
  //   const globalSoc = this.allSocs.find(soc => soc._id === socId);
  //   return globalSoc ? globalSoc.socNumber : socId;
  // }
  
  // Add this property to your component
  showCurrentSocsModal = false;
  
  // Load all SOCs from the system
  loadAllSocs(): void {
    this.bulkAssignLoading = true;
    this.paymentService.getAllSocs().subscribe({
      next: (response) => {
        this.allSocs = response.socNumbers.filter(soc => soc.status === 'active'); // Store full SOC objects
        console.log(this.allSocs);
        this.bulkAssignLoading = false;
      },
      error: (error) => {
        console.error('Error loading all SOCs:', error);
        this.bulkAssignLoading = false;
        Swal.fire('Error', 'Failed to load all SOCs', 'error');
      },
    });
  }
  
  

  // Helper method to get SOC number by ID
  getSocNumberById(socId: string): string {
    const soc = this.allSocs.find(soc => soc._id === socId);
    return soc ? soc.socNumber : socId;
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

  viewSocDetails(soc: SocNumber): void {
    this.selectedSoc = soc;
    this.viewModalVisible = true;
  }

  SetAsBorroedOrder(soc: SocNumber): void {
    this.selectedSoc = soc;
    this.borrowedVisible = true;
  }

  async SetBorrowed(socId: string): Promise<void> {
    try {
      const { value, isConfirmed } = await Swal.fire({
        title: 'Set SOC As Borrowed Order',
        html: `
          <label for="borrowedStatus">Mark as Borrowed:</label>
          <select id="borrowedStatus" class="swal2-input">
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
          <br><br>
          <label for="recipientName">Recipient Name:</label>
          <input id="recipientName" class="swal2-input" placeholder="Enter recipient name">
        `,
        showCancelButton: true,
        confirmButtonText: 'Assign',
        cancelButtonText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          const borrowedStatus = (document.getElementById('borrowedStatus') as HTMLSelectElement).value;
          const recipient = (document.getElementById('recipientName') as HTMLInputElement).value;
  
          if (!recipient) {
            Swal.showValidationMessage('You need to enter a recipient name.');
            return false;
          }
  
          return this.truckService
            .borrowedOrder(socId, {recipient: recipient})
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
          text: 'SOC assigned successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        this.loadPaymentDetails(this.paymentRef!._id);
      }
    } catch (error) {
      console.error('Error in SOC assignment:', error);
      Swal.fire('Error', 'Failed to complete SOC assignment', 'error');
    }
  }
  
  closeViewModal(): void {
    this.viewModalVisible = false;
    this.selectedSoc = null;
  }

  openEditSocModal(soc: SocNumber): void {
    this.selectedSoc = soc;
    this.editModalVisible = true;
    
    // Load related data for the dropdowns
    if (soc.plantId) {
      this.onPlantSelect({ target: { value: soc.plantId._id } });
    }

    // Populate the edit form
    this.editSocForm.patchValue({
      status: soc.status,
      socNumber: soc.socNumber,
      quantity: soc.quantity,
      plantId: soc.plantId?._id,
      productId: soc.productId?._id,
      destinationId: soc.destinationId?._id
    });
  }

  closeEditSocModal(): void {
    this.editModalVisible = false;
    this.selectedSoc = null;
    this.editSocForm.reset();
  }

  goBack(): void {
    this.router.navigate(['/main/transport/paymentrefs'])
  }

  onEditSocSubmit(): void {
    if (this.editSocForm.valid && this.selectedSoc && this.paymentRef) {
      this.formSubmitting = true;

      const socData = {
        ...this.editSocForm.value,
        quantity: Number(this.editSocForm.value.quantity)
      };

      this.paymentService.updateSoc(this.paymentRef._id, this.selectedSoc._id, socData)
        .pipe(finalize(() => this.formSubmitting = false))
        .subscribe({
          next: () => {
            Swal.fire({
              title: 'Success',
              text: 'SOC updated successfully',
              icon: 'success',
              timer: 2000
            });
            this.loadPaymentDetails(this.paymentRef!._id);
            this.closeEditSocModal();
          },
          error: (error) => {
            console.error('Error updating SOC:', error);
            Swal.fire('Error', error.error?.message || 'Failed to update SOC', 'error');
          }
        });
    } else {
      Object.keys(this.editSocForm.controls).forEach(key => {
        const control = this.editSocForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  getActiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter((soc) => soc.status === 'active') || [];
  }

  getInactiveSocs(): SocNumber[] {
    return this.paymentRef?.socNumbers.filter((soc) => soc.status === 'inactive') || [];
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
        this.loadAllSocs(); // Refresh the SOC list
      }
    } catch (error) {
      console.error('Error in truck assignment:', error);
      Swal.fire('Error', 'Failed to complete truck assignment', 'error');
    }
  }

  deleteSoc(socId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed && this.paymentRef) {
        this.paymentService.deleteSoc(this.paymentRef._id, socId)
          .subscribe({
            next: () => {
              Swal.fire(
                'Deleted!',
                'SOC has been deleted.',
                'success'
              );
              this.loadPaymentDetails(this.paymentRef!._id);
            },
            error: (error) => {
              console.error('Error deleting SOC:', error);
              Swal.fire('Error', error.error?.message || 'Failed to delete SOC', 'error');
            }
          });
      }
    });
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

  // Methods for handling multiple SOC assignment
  toggleSocSelection(socId: string): void {
    const index = this.selectedSocs.indexOf(socId);
    if (index === -1) {
      this.selectedSocs.push(socId);
    } else {
      this.selectedSocs.splice(index, 1);
    }
  }

  isSocSelected(socId: string): boolean {
    return this.selectedSocs.includes(socId);
  }

  openBulkAssignModal(): void {
    if (this.selectedSocs.length === 0) {
      Swal.fire('Warning', 'Please select at least one SOC to assign', 'warning');
      return;
    }
    this.bulkAssignModalVisible = true;
  }

  closeBulkAssignModal(): void {
    this.bulkAssignModalVisible = false;
    this.selectedSocs = [];
  }

  async bulkAssignToTruck(): Promise<void> {
    try {
      if (this.selectedSocs.length === 0) {
        Swal.fire('Warning', 'Please select at least one SOC to assign', 'warning');
        return;
      }

      const trucks = await this.loadAvailableTrucks();
      if (trucks.length === 0) {
        Swal.fire('Warning', 'No available trucks found', 'warning');
        return;
      }

      const truckOptions = trucks.reduce((acc, truck) => {
        acc[truck._id] = `${truck.truckNumber} ${truck.driver ? `(Driver: ${truck.driver.name})` : ''} - Capacity: ${truck.capacity || 'N/A'}`;
        return acc;
      }, {} as { [key: string]: string });

      const { value: selectedTruckId, isConfirmed } = await Swal.fire({
        title: 'Select Truck for Multiple SOCs',
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
            .assignSocListToTruck(truckId, this.selectedSocs)
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
          text: 'Multiple SOCs assigned to truck successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        this.selectedSocs = [];
        this.closeBulkAssignModal();
        this.loadPaymentDetails(this.paymentRef!._id);
        this.loadAllSocs(); // Refresh the list of all SOCs
      }
    } catch (error) {
      console.error('Error in bulk truck assignment:', error);
      Swal.fire('Error', 'Failed to complete truck assignment', 'error');
    }
  }
}