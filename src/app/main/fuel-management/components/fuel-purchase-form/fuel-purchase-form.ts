import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuelPurchaseCreateDto, FuelCard, Truck } from '../../../../shared/types/fuel.interface';
import { FuelPurchaseService } from '../../../../services/fuel-purchase.service';
import { FuelCardService } from '../../../../services/fuel-card.service';

@Component({
  selector: 'app-fuel-purchase-form',
  templateUrl: './fuel-purchase-form.html'
})
export class FuelPurchaseFormComponent implements OnInit {
  @Input() editMode = false;
  @Input() fuelPurchase: any | null = null;
  @Output() formSubmit = new EventEmitter<FuelPurchaseCreateDto>();
  @Output() cancelEdit = new EventEmitter<void>();

  purchaseForm!: FormGroup;
  trucks: any[] = [];
  fuelCards: FuelCard[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private fuelPurchaseService: FuelPurchaseService,
    private fuelCardService: FuelCardService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTrucks();
    this.loadFuelCards();

    if (this.editMode && this.fuelPurchase) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.purchaseForm = this.fb.group({
      truckId: ['', Validators.required],
      fuelCardId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  private patchForm(): void {
    if (this.fuelPurchase) {
      const truckId = typeof this.fuelPurchase.truckId === 'object'
        ? this.fuelPurchase.truckId._id
        : this.fuelPurchase.truckId;

      const fuelCardId = typeof this.fuelPurchase.fuelCardId === 'object'
        ? this.fuelPurchase.fuelCardId._id
        : this.fuelPurchase.fuelCardId;

      this.purchaseForm.patchValue({
        truckId: truckId || '',
        fuelCardId: fuelCardId || '',
        amount: this.fuelPurchase.amount
      });
    }
  }

  private loadTrucks(): void {
    this.loading = true;
    this.fuelPurchaseService.getTrucks().subscribe({
      next: (response) => {
        this.trucks = response.trucks || [];
        this.loading = false;

        // Ensure the form is patched after trucks are loaded
        if (this.editMode && this.fuelPurchase) {
          this.patchForm();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadFuelCards(): void {
    this.loading = true;
    this.fuelCardService.getFuelCards().subscribe({
      next: (response) => {
        this.fuelCards = response.data || [];
        this.loading = false;

        // Ensure the form is patched after fuel cards are loaded
        if (this.editMode && this.fuelPurchase) {
          this.patchForm();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      this.formSubmit.emit(this.purchaseForm.value as FuelPurchaseCreateDto);
    } else {
      this.purchaseForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }
}