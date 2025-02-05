import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../shared/types/driver-types';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-driver-list',
  templateUrl: './drivertlist.component.html'
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  filterForm!: FormGroup;
// Math: any;

Math = Math;

  constructor(
    private driverService: DriverService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createFilterForm();
    this.loadDrivers();
    this.setupFilterSubscription();
  }

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: ['']
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
        this.applyFilters();
      });
  }

  loadDrivers(): void {
    this.loading = true;
    this.driverService.getDrivers().subscribe({
      next: (response) => {
        this.drivers = response.drivers;
        this.total = this.drivers.length;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const { searchTerm, status } = this.filterForm.value;

    this.filteredDrivers = this.drivers.filter(driver => {
      const matchesSearch = !searchTerm || driver.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !status || driver.status === status;

      return matchesSearch && matchesStatus;
    });

    this.total = this.filteredDrivers.length;
    this.filteredDrivers = this.filteredDrivers.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || '';
  }

  deleteDriver(id: string): void {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.driverService.deleteDriver(id).subscribe({
        next: () => this.loadDrivers(),
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }
}