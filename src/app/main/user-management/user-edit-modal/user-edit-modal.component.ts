
// user-edit-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, } from '../../../core/services/auth.service';
import { User } from '../user-management/user-management.component';

export interface UserFormData {
  fullName: string;
  email: string;
  password?: string;
  role: string;
}

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
  roles = ['transport', 'super_admin', 'customer', 'finance'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createForm();
    if (this.user) {
      this.userForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        role: this.user.role
      });
    }
  }

  private createForm(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.user ? [] : [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.loading = true;
    const userData: UserFormData = this.userForm.value;

    const request = this.user
      ? this.authService.updateAdmin(this.user.id.toString(), userData)
      : this.authService.createAdmin(userData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (error:any) => {
        this.error = error?.error?.message || 'An error occurred';
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.userForm.reset();
    this.error = '';
    this.close.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}