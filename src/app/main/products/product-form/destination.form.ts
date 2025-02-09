import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  isEditMode = false;
  destinationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private route: ActivatedRoute,
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
    this.route.paramMap.subscribe(params => {
      this.destinationId = params.get('id');
      if (this.destinationId) {
        this.isEditMode = true;
        this.loadDestination(this.destinationId);
      }
    });
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

  private loadDestination(id: string): void {
    this.loading = true;
    this.plantService.getDestinationById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.destinationForm.patchValue(response.destination);
        },
        error: (error) => console.error('Error loading destination:', error)
      });
  }

  onSubmit(): void {
    if (this.destinationForm.valid) {
      this.loading = true;
      const destinationData = this.destinationForm.value;

      if (this.isEditMode && this.destinationId) {
        this.plantService.updateDestination(this.destinationId, destinationData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.router.navigate(['/main/categories/list']);
            },
            error: (error) => {
              console.error('Error updating destination:', error);
            }
          });
      } else {
        this.plantService.createDestination(destinationData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.router.navigate(['/main/categories/list']);
            },
            error: (error) => {
              console.error('Error creating destination:', error);
            }
          });
      }
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