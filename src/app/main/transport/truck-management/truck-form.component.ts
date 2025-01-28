import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TruckService } from '../../../services/truck.service';
import { Truck } from '../../../shared/types/truck-operation.types';

@Component({
  selector: 'app-truck-form',
  templateUrl: './truck-form.component.html'
})
export class TruckFormComponent implements OnInit {
  truckForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private truckService: TruckService,
    private router: Router
  ) {
    this.truckForm = this.fb.group({
      truckNumber: [''],
      capacity: ['' ],
      status: ['active' ]
    });
  }

  ngOnInit(): void {


  }

  onSubmit(): void {
    if (this.truckForm.invalid) return 
      this.loading = true;

      const formData = this.truckForm.value
      this.truckService.createTruck(formData).subscribe({
        next: () => {
          this.router.navigate(['main/transport/trucks']);
        },
        error: (error) => {
          console.error('Error creating truck:', error);
          this.loading = false;
        }
      });
    }
  
}