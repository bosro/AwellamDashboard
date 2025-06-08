import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuelCard, FuelCardCreateDto, Plant } from '../../../../shared/types/fuel.interface';
import { FuelCardService } from '../../../../services/fuel-card.service';

@Component({
  selector: 'app-fuel-card-form',
  templateUrl: './fuel-card-form.html'
})
export class FuelCardFormComponent implements OnInit {
  @Input() editMode = false;
  @Input() fuelCard: FuelCard | null = null;
  @Output() formSubmit = new EventEmitter<FuelCardCreateDto>();
  @Output() cancelEdit = new EventEmitter<void>();

  fuelCardForm!: FormGroup;
  plants: Plant[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private fuelCardService: FuelCardService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPlants();

    // Ensure the form is patched if in edit mode
    if (this.editMode && this.fuelCard) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.fuelCardForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      plantId: ['', Validators.required]
    });
  }

  private patchForm(): void {
    if (this.fuelCard) {
      const plantId = typeof this.fuelCard.plantId === 'object' 
        ? (this.fuelCard.plantId as Plant)._id 
        : this.fuelCard.plantId;

      this.fuelCardForm.patchValue({
        name: this.fuelCard.name,
        description: this.fuelCard.description,
        balance: this.fuelCard.balance,
        plantId: plantId || ''
      });
    }
  }

  private loadPlants(): void {
    this.loading = true;
    this.fuelCardService.getPlants().subscribe({
      next: (response) => {
        this.plants = response.plants || [];
        this.loading = false;

        // Ensure the form is patched after plants are loaded
        if (this.editMode && this.fuelCard) {
          this.patchForm();
        }
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.fuelCardForm.valid) {
      const formData = this.fuelCardForm.value as FuelCardCreateDto;
      this.formSubmit.emit(formData);
    } else {
      this.fuelCardForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }
}