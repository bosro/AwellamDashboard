import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Plant, PlantService } from '../../../services/plant.service';
import { finalize } from 'rxjs/internal/operators/finalize';

export interface UserFormData {
  _id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
}

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss']
})
export class UserEditModalComponent implements OnInit {
  @Input() show = false;
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  userForm!: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;
  plants!: Plant[];
  roles = ['Loading_officer', 'super_admin', 'Stocks_Manager', 'Admin_Support']; // Example roles, replace with actual roles

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private plantService: PlantService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.user) {
      this.userForm.patchValue(this.user);
    }
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['' ,Validators.required],
      phoneNumber:[''],
      role: ['', Validators.required],
      plant: ['', Validators.required]
    });
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.loading = true;
    const userData: UserFormData = this.userForm.value;

    const request = this.user
      ? this.authService.updateAdmin(this.user._id, userData)
      : this.authService.createAdmin(userData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
        window.location.reload();
      },
      error: (error: any) => {
        this.error = error?.error?.message || 'An error occurred';
        this.loading = false;
      }
    });
  }
}