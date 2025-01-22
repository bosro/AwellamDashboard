import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html'
})
export class UserEditModalComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  userForm!: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  roles = [
    { id: 'admin', name: 'Administrator', permissions: ['all'] },
    { id: 'manager', name: 'Manager', permissions: ['view_all', 'edit_basic'] },
    { id: 'operator', name: 'Operator', permissions: ['view_assigned', 'edit_basic'] },
    { id: 'driver', name: 'Driver', permissions: ['view_own'] }
  ];

  permissions = [
    { id: 'view_all', name: 'View All' },
    { id: 'edit_all', name: 'Edit All' },
    { id: 'delete_all', name: 'Delete All' },
    { id: 'view_assigned', name: 'View Assigned' },
    { id: 'edit_basic', name: 'Edit Basic' },
    { id: 'view_own', name: 'View Own' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
       fullName: this.user.fullName,
        email: this.user.email,
        role: this.user.role,
        status: this.user.status,
        permissions: this.user.permissions
      });
      this.userForm.get('email')!.disable();
    }
  }

  private createForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.user ? [] : [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      ]],
      role: ['', Validators.required],
      status: ['active'],
      permissions: [[]]
    });

    // Update permissions when role changes
    this.userForm.get('role')!.valueChanges.subscribe(role => {
      const rolePermissions = this.roles.find(r => r.id === role)?.permissions || [];
      this.userForm.patchValue({ permissions: rolePermissions }, { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    const userData = { ...this.userForm.value };

    const request = this.user
      ? this.authService.updateUser(this.user.id, userData)
      : this.authService.createUser(userData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
        this.close.emit();
      },
      error: error => {
        this.error = error?.error?.message || 'An error occurred';
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  closeModal(): void {
    this.userForm.reset();
    this.error = '';
    this.close.emit();
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.userForm.get('password')!.value;
    if (!password) return 'weak';

    let score = 0;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score >= 4) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  }

  getRoleDescription(roleId: string): string {
    return this.roles.find(r => r.id === roleId)?.permissions.join(', ') || '';
  }
}