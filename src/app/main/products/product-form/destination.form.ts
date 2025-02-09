import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlantService, Plant } from '../../../services/plant.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-destination-form',
  templateUrl: './destination.form.html'
})
export class DestinationFormComponent implements OnInit {
  destinationForm: FormGroup;
  loading = false;
  plants: Plant[] = [];

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private router: Router
  ) {
    this.destinationForm = this.fb.group({
      destination: ['', Validators.required],
      plantId: ['', Validators.required],
      rates: ['', Validators.required],
      cost: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPlants();
  }

  private loadPlants(): void {
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

  onSubmit(): void {
    if (this.destinationForm.valid) {
      this.loading = true;
      this.plantService.createDestination(this.destinationForm.value)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.router.navigate(['/main/categories/list']);
          },
          error: (error) => {
            console.error('Error creating category:', error);
          }
        });
    } else {
      Object.keys(this.destinationForm.controls).forEach(key => {
        const control = this.destinationForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}