import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  phoneNumber?: string;
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
  users: any[] = [];
  selectedUsers: Set<string> = new Set();
  loading = false;
  metrics!: UserMetrics;
  filterForm!: FormGroup;
  // showUserModal = false;
  editingUser: User | null = null;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  error: string | null = null;
  showUserModal: boolean = false;

  // @Input() user: any;
  
  roles = ['Loading_officer', 'super_admin', 'Stocks_Manager', 'Admin_Support','Accounting-Officer'];

  roleClasses: Record<string, string> = {
    Loading_officer: 'bg-purple-100 text-purple-800',
    super_admin: 'bg-blue-100 text-blue-800', 
    Stocks_Manager: 'bg-yellow-100 text-yellow-800',
    Admin_Support: 'bg-green-100 text-green-800'
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
    this.error = null;
    
    const filters: UserFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.authService.getAdmins(filters).subscribe({
      next: (response: any) => {
        this.users = response.admins.map((user: any) => ({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status || 'inactive',
          lastLogin: user.lastLogin || 'Not logged in',
          phoneNumber: user.phoneNumber
        }));
        this.total = response.total || this.users.length;
        this.calculateMetrics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }


  // openUserForm(user: any): void {

  //   this.editingUser = user;

  //   this.showUserModal = true;
  // }

  openUserForm(user?: User): void {
    this.editingUser = user || null;
    this.showUserModal = true;
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

  toggleSelection(userId: string): void {
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
      this.users.forEach(user => this.selectedUsers.add(user._id));
    }
  }

  // updateUserStatus(userId: string, status: 'active' | 'inactive'): void {
  //   this.authService.updateUserStatus(userId, status).subscribe({
  //     next: () => {
  //       this.loadUsers();
  //       this.selectedUsers.clear();
  //     },
  //     error: (error) => {
  //       console.error('Error updating user status:', error);
  //       this.error = 'Failed to update user status.';
  //     }
  //   });
  // }

  // bulkUpdateStatus(status: 'active' | 'inactive'): void {
  //   if (this.selectedUsers.size === 0) return;

  //   const updates = Array.from(this.selectedUsers).map(userId =>
  //     this.authService.updateUserStatus(userId, status)
  //   );

  //   Promise.all(updates)
  //     .then(() => {
  //       this.selectedUsers.clear();
  //       this.loadUsers();
  //     })
  //     .catch(error => {
  //       console.error('Error in bulk status update:', error);
  //       this.error = 'Failed to update users status.';
  //     });
  // }

  // openUserForm(user?: User): void {
  //   this.editingUser = user || null;
  //   this.showUserModal = true;
  // }

  onUserSaved(): void {
    this.loadUsers();
    this.showUserModal = false;
    this.editingUser = null;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadUsers();
  }

  getRoleClass(role: string): string {
    return this.roleClasses[role] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  hasSelectedUsers(): boolean {
    return this.selectedUsers.size > 0;
  }

  getSelectedCount(): number {
    return this.selectedUsers.size;
  }
}