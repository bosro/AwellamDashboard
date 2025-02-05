import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlantService } from '../../../services/plant.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-plant-form',
  templateUrl: './plant-form.component.html'
})
export class PlantFormComponent implements OnInit {
  plantForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private router: Router
  ) {
    this.plantForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.plantForm.valid) {
      this.loading = true;
      this.plantService.createPlant(this.plantForm.value.name)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.router.navigate(['/main/products/list']);
          },
          error: (error) => {
            console.error('Error creating plant:', error);
          }
        });
    } else {
      Object.keys(this.plantForm.controls).forEach(key => {
        const control = this.plantForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}