// user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface UserMetrics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

interface UserFilters {
  searchTerm?: string;
  role?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  pageSize?: number;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUsers: Set<number> = new Set();
  loading = false;
  metrics!: UserMetrics;
  filterForm!: FormGroup;
  showUserModal = false;
  editingUser: User | null = null;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  
  roles = ['transport', 'super_admin', 'customer', 'finance'];

  roleClasses: Record<string, string> = {
    transport: 'bg-purple-100 text-purple-800',
    super_admin: 'bg-blue-100 text-blue-800', 
    customer: 'bg-yellow-100 text-yellow-800',
    finance: 'bg-green-100 text-green-800'
  };

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilterSubscription();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      role: [''],
      status: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    const filters: UserFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.authService.getAdmins(filters).subscribe({
      next: (response) => {
        this.users = response.admins;
        // this.total = response.total || 0;
        this.calculateMetrics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  private calculateMetrics(): void {
    const byRole: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    this.users.forEach(user => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
      if (user.status === 'active') active++;
      else inactive++;
    });

    this.metrics = {
      total: this.users.length,
      active,
      inactive,
      byRole
    };
  }

  toggleSelection(userId: number): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedUsers.size === this.users.length) {
      this.selectedUsers.clear();
    } else {
      this.users.forEach(user => this.selectedUsers.add(user.id));
    }
  }

  updateUserStatus(userId: number, status: 'active' | 'inactive'): void {
    this.authService.updateUserStatus(userId, status).subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Error updating user status:', error)
    });
  }

  bulkUpdateStatus(status: 'active' | 'inactive'): void {
    const updates = Array.from(this.selectedUsers).map(userId =>
      this.authService.updateUserStatus(userId, status)
    );

    Promise.all(updates)
      .then(() => {
        this.selectedUsers.clear();
        this.loadUsers();
      })
      .catch(error => console.error('Error in bulk status update:', error));
  }

  openUserForm(user?: User): void {
    this.editingUser = user || null;
    this.showUserModal = true;
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  onUserSaved(): void {
    this.loadUsers();
    this.showUserModal = false;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  getRoleClass(role: string): string {
    return this.roleClasses[role] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
}
