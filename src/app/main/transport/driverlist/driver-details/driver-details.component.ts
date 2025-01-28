// src/app/components/driver-details/driver-details.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../../../services/driver.service';
import { Driver } from '../../../../shared/types/driver-types';

@Component({
  selector: 'app-driver-details',
  templateUrl: './driver-details.component.html'
})
export class DriverDetailsComponent implements OnInit {
  driver: Driver | null = null;
  loading = false;

  constructor(
    private driverService: DriverService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadDriverDetails(id);
  }

  loadDriverDetails(id: string): void {
    this.loading = true;
    this.driverService.getDriverById(id).subscribe({
      next: (response) => {
        this.driver = response.driver;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading driver details:', error);
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
}