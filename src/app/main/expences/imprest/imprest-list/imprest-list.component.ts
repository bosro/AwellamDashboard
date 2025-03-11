// src/app/components/imprest-list/imprest-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Imprest } from '../imprest.model';
import { ImprestService } from '../../../../services/imprest.service';

@Component({
  selector: 'app-imprest-list',
  templateUrl: './imprest-list.component.html'
})
export class ImprestListComponent implements OnInit {
  imprests!: any[];
  loading = true;
  error = '';

  constructor(
    private imprestService: ImprestService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadImprests();
  }

  loadImprests(): void {
    this.loading = true;
    this.imprestService.getAllImprests().subscribe({
      next: (response) => {
        if (response.success) {
          this.imprests = response.data;
        } else {
          this.error = 'Failed to load imprests';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading imprests: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/main/expenses/imprest', id]);
  }

  editImprest(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/main/expenses/imprest/edit', id]);
  }

  deleteImprest(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this imprest?')) {
      this.imprestService.deleteImprest(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadImprests();
          } else {
            this.error = 'Failed to delete imprest';
          }
        },
        error: (err) => {
          this.error = 'Error deleting imprest: ' + (err.message || 'Unknown error');
        }
      });
    }
  }

  createNewImprest(): void {
    this.router.navigate(['/main/expenses/imprest/create']);
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'GHC' });
  }
}