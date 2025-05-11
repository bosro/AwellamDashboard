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
  paymentRef: any | null = null;
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
        // Validators.required, 
        // Validators.minLength(12), 
        // Validators.maxLength(12),
        Validators.pattern(/^SOC\d{9}$/)
      ]],
      quantity: ['', ],
      plantId: ['', Validators.required],
      productId: ['', Validators.required],
      destinationId: ['', ],
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
    const plantId=this.paymentRef?.plantId?._id;
    console.log(plantId)
    if (id) {
      this.loadPaymentDetails(id);
      
      this.loadPlants();
      // this.loadAllSocs(plantId); // Load all SOCs from the system
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
  loadAllSocs(plantId:any): void {
    this.bulkAssignLoading = true;
    // const plantId = this.paymentRef?.plantId?._id;
    this.paymentService.getActiveSocsByPlant(plantId).subscribe({
      next: (response) => {
        this.allSocs = response.socNumbers.filter(soc => soc.status === 'active'); // Store full SOC objects
        console.log(this.allSocs)
        console.log(this.allSocs);
        this.bulkAssignLoading = false;
      },
      error: (error) => {
        console.error('Error loading all SOCs:', error);
        this.bulkAssignLoading = false;
        Swal.fire('Warning', 'No active SOC numbers found for this plant', 'warning');
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

           // Ensure paymentRef is defined before accessing plantId
      if (this.paymentRef?.plantId?._id) {
        const plantId = this.paymentRef.plantId._id;
        console.log('Plant ID:', plantId);

        // Call loadAllSocs only after we have the correct plantId
        this.loadAllSocs(plantId);
      }
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
            Swal.fire('Warning', 'No active SOC numbers found for this plant', 'warning');
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
        // this.loadAllSocs(); // Refresh the SOC list
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
        this.paymentService.deleteSoc( socId)
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

 /**
 * Assigns a SOC number to the Self Lifting after collecting customer information
 * @param socNumber - The SOC number to be assigned
 * @returns Promise resolving when assignment is complete
 */
 async assignSocToSelfList(socNumber: string): Promise<void> {
  try {
    // Fetch customers for the dropdown
    const customersResponse = await this.paymentService.getCustomers().toPromise();

    // Check if customersResponse or customers is undefined
    if (!customersResponse || !customersResponse.customers) {
      Swal.fire({
        icon: 'error',
        title: '<div style="color: #dc3545; font-size: 24px; font-weight: 600;">Error</div>',
        text: 'Failed to fetch customers',
        confirmButtonColor: '#4a6da7',
        backdrop: `rgba(0,0,0,0.4)`,
        customClass: {
          confirmButton: 'btn btn-primary'
        }
      });
      return;
    }

    let customers = customersResponse.customers;

    if (customers.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '<div style="color: #ffc107; font-size: 24px; font-weight: 600;">Warning</div>',
        text: 'No customers found',
        confirmButtonColor: '#4a6da7',
        backdrop: `rgba(0,0,0,0.4)`,
        customClass: {
          confirmButton: 'btn btn-primary'
        }
      });
      return;
    }

    // Show the modal for user input
    const { value: formData, isConfirmed } = await Swal.fire({
      title: '<div style="font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Assign SOC to Self Lifting</div>',
      html: `
        <style>
          .form-container {
            text-align: left;
            padding: 10px 5px;
            max-width: 450px;
            margin: 0 auto;
          }
          .form-group {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
          }
          .form-label {
            font-weight: 600;
            margin-bottom: 8px;
            color: #2c3e50;
            font-size: 14px;
            text-align: left;
          }
          .form-control {
            display: block;
            width: 100%;
            padding: 10px 14px;
            font-size: 14px;
            line-height: 1.5;
            color: #495057;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid #ced4da;
            border-radius: 4px;
            transition: all 0.15s ease-in-out;
          }
          .form-control:focus {
            color: #495057;
            background-color: #fff;
            border-color: #4a6da7;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(74, 109, 167, 0.25);
          }
          .form-select {
            display: block;
            width: 100%;
            padding: 10px 14px;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            color: #495057;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid #ced4da;
            border-radius: 4px;
            transition: all 0.15s ease-in-out;
          }
          .form-select:focus {
            border-color: #4a6da7;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(74, 109, 167, 0.25);
          }
          .swal-button-confirm, .swal-button-cancel {
            font-weight: 500 !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
          }
          .swal-actions {
            margin-top: 20px !important;
          }
        </style>
        <div class="form-container">
          <div class="form-group">
            <label class="form-label" for="customerSearch">Search Customer</label>
            <input id="customerSearch" class="form-control" placeholder="Search customer by name">
          </div>
          <div class="form-group">
            <label class="form-label" for="customer">Select Customer</label>
            <select id="customer" class="form-select">
              ${customers
                .map(
                  (customer) =>
                    `<option value="${customer._id}">${customer.fullName}</option>`
                )
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="truckNumber">Truck Number</label>
            <input id="truckNumber" class="form-control" placeholder="Enter truck number">
          </div>
          <div class="form-group">
            <label class="form-label" for="driverName">Driver Name</label>
            <input id="driverName" class="form-control" placeholder="Enter driver name">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Assign',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4a6da7',
      cancelButtonColor: '#6c757d',
      buttonsStyling: true,
      focusConfirm: false,
      showLoaderOnConfirm: true,
      didOpen: () => {
        const searchInput = document.getElementById('customerSearch') as HTMLInputElement;
        const customerSelect = document.getElementById('customer') as HTMLSelectElement;

        // Add event listener for search input
        searchInput.addEventListener('input', () => {
          const searchValue = searchInput.value.toLowerCase();
          customerSelect.innerHTML = customers
            .filter((customer) =>
              customer.fullName.toLowerCase().includes(searchValue)
            )
            .map(
              (customer) =>
                `<option value="${customer._id}">${customer.fullName}</option>`
            )
            .join('');
        });
      },
      preConfirm: () => {
        const customer = (document.getElementById('customer') as HTMLSelectElement).value;
        const truckNumber = (document.getElementById('truckNumber') as HTMLInputElement).value;
        const driverName = (document.getElementById('driverName') as HTMLInputElement).value;

        if (!customer || !truckNumber || !driverName) {
          Swal.showValidationMessage('<span style="color: #dc3545; font-weight: 500;">All fields are required</span>');
          return false;
        }

        return { customer, truckNumber, driverName };
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (isConfirmed && formData) {
      // Prepare the payload
      const payload = {
        customer: formData.customer,
        socNumber,
        truckNumber: formData.truckNumber,
        driverName: formData.driverName,
      };

      // Call the API to assign the SOC
      await this.paymentService.assignSocToSelfList(payload).toPromise();

      // Show success message
      Swal.fire({
        icon: 'success',
        title: '<div style="color: #28a745; font-size: 24px; font-weight: 600;">Success!</div>',
        html: '<div style="color: #2c3e50; font-size: 16px; margin: 10px 0;">SOC assigned to Self Lifting successfully.</div>',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        backdrop: `rgba(0,0,0,0.4)`,
        customClass: {
          popup: 'animated fadeInDown faster'
        }
      });

      // Refresh the payment details
      this.loadPaymentDetails(this.paymentRef!._id);
    }
  } catch (error) {
    console.error('Error assigning SOC to Self Lifting:', error);
    Swal.fire({
      icon: 'error',
      title: '<div style="color: #dc3545; font-size: 24px; font-weight: 600;">Error</div>',
      html: '<div style="color: #2c3e50; font-size: 16px; margin: 10px 0;">Failed to assign SOC to Self Lifting.</div>',
      confirmButtonColor: '#4a6da7',
      backdrop: `rgba(0,0,0,0.4)`,
      customClass: {
        confirmButton: 'btn btn-primary'
      }
    });
  }
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
        // this.loadAllSocs(); // Refresh the list of all SOCs
      }
    } catch (error) {
      console.error('Error in bulk truck assignment:', error);
      Swal.fire('Error', 'Failed to complete truck assignment', 'error');
    }
  }
}