import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Plant, PlantService } from '../../../services/plant.service';
import { finalize } from 'rxjs/internal/operators/finalize';
// import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-admin-form-modal',
  template: `
    <div *ngIf="visible" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75" (click)="onClose()"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              {{user ? 'Edit' : 'Add'}} Admin
            </h3>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-500">
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <form [formGroup]="adminForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Full Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  formControlName="fullName"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  [ngClass]="{'border-red-500': isFieldInvalid('fullName')}">
                <div *ngIf="isFieldInvalid('fullName')" class="mt-1 text-sm text-red-600">
                  Full name is required
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  [ngClass]="{'border-red-500': isFieldInvalid('email')}">
                <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
                  Valid email is required
                </div>
              </div>

              <!-- Password (only for new admin) -->
              <div *ngIf="!user">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  formControlName="password"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  [ngClass]="{'border-red-500': isFieldInvalid('password')}">
                <div *ngIf="isFieldInvalid('password')" class="mt-1 text-sm text-red-600">
                  Password must be at least 8 characters
                </div>
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  formControlName="phoneNumber"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              </div>

              <!-- Role -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  formControlName="role"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="Loading_officer">Loading Officer</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="Stocks_Manager">Stocks Manager</option>
                  <option value="Admin_Support">Admin Support</option>
                </select>
              </div>


              <div>
        <label class="block text-sm font-medium text-gray-700">Plant</label>
        <select 
          formControlName="plantId"
          class="mt-1 block w-full px-3 py-2 border rounded-md"
          [class.border-red-500]="adminForm.get('plantId')?.invalid && adminForm.get('plantId')?.touched">
          <option value="">Select Plant</option>
          <option *ngFor="let plant of plants " [value]="plant._id">{{plant?.name}}</option>
        </select>
      </div>
            </div>


           

            <!-- Error Message -->
            <div *ngIf="error" class="text-red-600 text-sm">
              {{ error }}
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-4 pt-4">
              <button 
                type="button"
                (click)="onClose()"
                class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="adminForm.invalid || loading"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{loading ? 'Saving...' : (user ? 'Update' : 'Create')}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminFormModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  adminForm: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  plants!: Plant[];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private plantService: PlantService
  ) {
    this.adminForm = this.createForm();
  }

  ngOnInit() {
    this.initializeForm();
    this.loadPlants()
  }

   loadPlants(): void {
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

  ngOnChanges() {
    if (this.visible) {
      this.initializeForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: [''],
      role: ['Loading_officer', Validators.required],
      plantId: ['']
    });
  }

  private initializeForm(): void {
    if (this.user) {
      // Remove password validation for editing
      this.adminForm.get('password')?.clearValidators();
      this.adminForm.get('password')?.updateValueAndValidity();
      
      this.adminForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        phoneNumber: this.user.phoneNumber,
        role: this.user.role,
        plantId: this.user.plantId
      });
    } else {
      this.adminForm.reset({
        role: 'Loading_officer'
      });
      // Restore password validation for new admin
      this.adminForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.adminForm.get('password')?.updateValueAndValidity();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.adminForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClose(): void {
    this.error = null;
    this.close.emit();
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      Object.keys(this.adminForm.controls).forEach(key => {
        const control = this.adminForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const userData = this.adminForm.value;
    
    // Remove password if editing
    if (this.user) {
      delete userData.password;
    }

    const request = this.user
      ? this.authService.updateAdmin(this.user._id, userData)
      : this.authService.createAdmin(userData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
        this.onClose();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'An error occurred while saving the admin';
        console.error('Error saving admin:', error);
      }
    });
  }
}