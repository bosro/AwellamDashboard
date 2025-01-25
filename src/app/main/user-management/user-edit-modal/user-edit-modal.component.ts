// user-edit-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService,  } from '../../../core/services/auth.service';


enum UserRole {
  TRANSPORT = "transport",
  SUPER_ADMIN = "super_admin",
  CUSTOMER = "customer",
  FINANCE = "finance"
}


export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
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

  roles = Object.values(UserRole);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        role: this.user.role
      });
    }
  }


  private createForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.user ? [] : [
        Validators.required,
        Validators.minLength(8)
      ]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.loading = true;
    const userData = this.userForm.value;

    const request = this.user
      ? this.authService.editAdmin(this.user.id, userData)
      : this.authService.createAdmin(userData);

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

  closeModal(): void {
    this.userForm.reset();
    this.error = '';
    this.close.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}