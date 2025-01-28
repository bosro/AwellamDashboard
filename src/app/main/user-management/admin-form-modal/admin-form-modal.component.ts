// admin-form-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-form-modal',
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75" (click)="close()"></div>

        <div class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              {{editingUser ? 'Edit' : 'Add'}} Admin
            </h3>
            <button (click)="close()" class="text-gray-400 hover:text-gray-500">
              <i class="ri-close-line text-2xl"></i>
            </button>
          </div>

          <form [formGroup]="adminForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Full Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" formControlName="fullName" 
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                       [class.border-red-500]="isFieldInvalid('fullName')">
                <div *ngIf="isFieldInvalid('fullName')" class="mt-1 text-sm text-red-600">
                  Full name is required
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" formControlName="email" 
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                       [class.border-red-500]="isFieldInvalid('email')">
                <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
                  Valid email is required
                </div>
              </div>

              <!-- Password -->
              <div *ngIf="!editingUser">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div class="relative">
                  <input [type]="showPassword ? 'text' : 'password'" 
                         formControlName="password"
                         class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                         [class.border-red-500]="isFieldInvalid('password')">
                  <button type="button" 
                          (click)="showPassword = !showPassword"
                          class="absolute right-3 top-2.5 text-gray-400">
                    <i [class]="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                  </button>
                </div>
                <div *ngIf="isFieldInvalid('password')" class="mt-1 text-sm text-red-600">
                  Password must be at least 8 characters
                </div>
              </div>

              <!-- Role -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select formControlName="role" 
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option *ngFor="let role of roles" [value]="role.id">{{role.name}}</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end space-x-4 pt-4">
              <button type="button" 
                      (click)="close()"
                      class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      [disabled]="adminForm.invalid || loading"
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <i *ngIf="loading" class="ri-loader-4-line animate-spin mr-2"></i>
                {{editingUser ? 'Update' : 'Create'}} Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminFormModalComponent {
  @Input() isOpen = false;
  @Input() editingUser: User | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  adminForm: FormGroup;
  loading = false;
  showPassword = false;
  roles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'operator', name: 'Operator' }
  ];

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.adminForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['admin', Validators.required]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.adminForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  close(): void {
    this.closeModal.emit();
    this.adminForm.reset();
  }

  onSubmit(): void {
    if (this.adminForm.valid) {
      this.loading = true;
      const userData = this.adminForm.value;

      const request = this.editingUser 
        ? this.authService.updateUser(this.editingUser.id, userData)
        : this.authService.createAdmin(userData);

      request.subscribe({
        next: () => {
          this.saved.emit();
          this.close();
        },
        error: (error) => {
          console.error('Error saving admin:', error);
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.adminForm.controls).forEach(key => {
        const control = this.adminForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}