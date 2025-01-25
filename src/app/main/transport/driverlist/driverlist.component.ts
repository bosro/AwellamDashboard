// src/app/components/driver-list/driver-list.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../shared/types/driver-types';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-driver-list',
  templateUrl: './drivertlist.component.html'
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  loading = false;
  filterForm!: FormGroup;

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
        this.loadDrivers();
      });
  }

  loadDrivers(): void {
    this.loading = true;
    this.driverService.getDrivers().subscribe({
      next: (response) => {
        this.drivers = response.drivers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || '';
  }

  clearFilters(): void {
    this.filterForm.reset();
  }
}