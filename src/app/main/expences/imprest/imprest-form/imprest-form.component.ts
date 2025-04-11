// src/app/components/imprest-form/imprest-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Imprest } from '../imprest.model';
import { ImprestService } from '../../../../services/imprest.service';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Destination, Plant } from '../../../../services/plant.service';


interface ApiResponse {
  message: string;
  plants?: Plant[];
  destinations?: Destination[];
  // socNumbers?: SOC[];
  [key: string]: any;
}


@Component({
  selector: 'app-imprest-form',
  templateUrl: './imprest-form.component.html'
})
export class ImprestFormComponent implements OnInit {
  imprestForm: FormGroup;
  isEditMode = false;
  imprestId: string = '';
  loading = false;
  submitting = false;
  error = '';
  plants: Plant[] = [];

  private apiUrl = `${environment.apiUrl}`;
  
  constructor(
    private fb: FormBuilder,
    private imprestService: ImprestService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.imprestForm = this.fb.group({
      date: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      plantId: ['']
    });
  }

  ngOnInit(): void {
    this.getPlants()
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.imprestId = params['id'];
        this.loadImprestData();
      
      }
    });
  }

  loadImprestData(): void {
    this.loading = true;
    this.imprestService.getImprestById(this.imprestId).subscribe({
      next: (response) => {
        if (response.success) {
          const imprest = response.data;
          // Format date to YYYY-MM-DD for the input field
          const date = new Date(imprest.date);
          const formattedDate = date.toISOString().split('T')[0];
          
          this.imprestForm.patchValue({
            date: formattedDate,
            amount: imprest.amount,
            description: imprest.description,
            plantId: imprest.plantId
          });
        } else {
          this.error = 'Failed to load imprest data';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading imprest: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }


  getPlants(): void {
    this.loading = true;
    this.http.get<ApiResponse>(`${this.apiUrl}/plants/get`).subscribe({
      next: (response) => {
        if (response.plants) {
          this.plants = response.plants;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.loading = false;
        this.error = 'Failed to load plants. Please try again later.';
      },
    });
  }

  onSubmit(): void {
    if (this.imprestForm.invalid) {
      this.imprestForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const imprestData: Imprest = {
      date: this.imprestForm.value.date,
      amount: parseFloat(this.imprestForm.value.amount),
      description: this.imprestForm.value.description,
      plantId: this.imprestForm.value.plantId,
    };

    if (this.isEditMode) {
      this.imprestService.updateImprest(this.imprestId, imprestData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/main/expenses/imprest/']);
          } else {
            this.error = 'Failed to update imprest';
            this.submitting = false;
          }
        },
        error: (err) => {
          this.error = 'Error updating imprest: ' + (err.message || 'Unknown error');
          this.submitting = false;
        }
      });
    } else {
      this.imprestService.createImprest(imprestData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/main/expenses/imprest/']);
          } else {
            this.error = 'Failed to create imprest';
            this.submitting = false;
          }
        },
        error: (err) => {
          this.error = 'Error creating imprest: ' + (err.message || 'Unknown error');
          this.submitting = false;
        }
      });
    }
  }

  cancelForm(): void {
    this.router.navigate(['/main/expenses/imprest']);
  }

  // Helper methods for form validation
  get dateControl() { return this.imprestForm.get('date'); }
  get amountControl() { return this.imprestForm.get('amount'); }
  get descriptionControl() { return this.imprestForm.get('description'); }
}