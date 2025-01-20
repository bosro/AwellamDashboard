import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface UserMetrics {
  total: number;
  active: number;
  inactive: number;
  byRole: { [key: string]: number };
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUsers: Set<number> = new Set();
  loading = false;
  metrics: UserMetrics;
  filterForm: FormGroup;
  showUserModal = false;
  editingUser: User | null = null;
  currentPage = 1;
  pageSize = 10;
  total = 0;

  roles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'operator', name: 'Operator' },
    { id: 'driver', name: 'Driver' }
  ];

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
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    // Replace with actual API call
    this.authService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.data;
        this.total = response.total;
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
    const byRole = {};
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
      this.users.forEach(user => {
        this.selectedUsers.add(user.id);
      });
    }
  }

  updateUserStatus(userId: number, status: 'active' | 'inactive'): void {
    this.authService.updateUserStatus(userId, status).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user status:', error);
      }
    });
  }

  bulkUpdateStatus(status: 'active' | 'inactive'): void {
    const updates = Array.from(this.selectedUsers).map(userId =>
      this.authService.updateUserStatus(userId, status)
    );

    Promise.all(updates).then(() => {
      this.selectedUsers.clear();
      this.loadUsers();
    });
  }

  openUserForm(user?: User): void {
    this.editingUser = user || null;
    this.showUserModal = true;
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  bulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedUsers.size} users?`)) {
      const deletions = Array.from(this.selectedUsers).map(userId =>
        this.authService.deleteUser(userId)
      );

      Promise.all(deletions).then(() => {
        this.selectedUsers.clear();
        this.loadUsers();
      });
    }
  }

  exportUsers(format: 'excel' | 'pdf'): void {
    const selectedIds = Array.from(this.selectedUsers);
    this.authService.exportUsers(format, selectedIds).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users-export.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getRoleClass(role: string): string {
    const classes = {
      'admin': 'bg-purple-100 text-purple-800',
      'manager': 'bg-blue-100 text-blue-800',
      'operator': 'bg-yellow-100 text-yellow-800',
      'driver': 'bg-green-100 text-green-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  getLastLoginText(date: string): string {
    if (!date) return 'Never';
    const lastLogin = new Date(date);
    const now = new Date();
    const diff = now.getTime() - lastLogin.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }
}