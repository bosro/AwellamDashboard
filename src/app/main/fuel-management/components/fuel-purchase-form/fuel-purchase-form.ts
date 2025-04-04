import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuelPurchase, FuelPurchaseCreateDto, FuelCard, Truck } from '../../../../shared/types/fuel.interface';
import { FuelPurchaseService } from '../../../../services/fuel-purchase.service';
import { FuelCardService } from '../../../../services/fuel-card.service';

@Component({
  selector: 'app-fuel-purchase-form',
  templateUrl: './fuel-purchase-form.html'  // Fixed typo in template URL (was 'pucahse')
})
export class FuelPurchaseFormComponent implements OnInit {  // Added OnInit implementation
  @Input() editMode = false;
  @Input() fuelPurchase: FuelPurchase | null = null;
  @Output() formSubmit = new EventEmitter<FuelPurchaseCreateDto>();  // Changed from any to proper type
  @Output() cancelEdit = new EventEmitter<void>();

  purchaseForm!: FormGroup;
  trucks: Truck[] = [];
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
      amount: [0, [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required]  // Added date field if needed
    });
  }
  
  private patchForm(): void {
    if (this.fuelPurchase) {
      const truckId = typeof this.fuelPurchase.truckId === 'object' 
        ? (this.fuelPurchase.truckId as Truck)._id 
        : this.fuelPurchase.truckId;
        
      const fuelCardId = typeof this.fuelPurchase.fuelCardId === 'object' 
        ? (this.fuelPurchase.fuelCardId as FuelCard)._id 
        : this.fuelPurchase.fuelCardId;
        
      this.purchaseForm.patchValue({
        truckId: truckId || '',
        fuelCardId: fuelCardId || '',
        amount: this.fuelPurchase.amount,
        // date: this.fuelPurchase.date || new Date()
      });
    }
  }
  
  private loadTrucks(): void {
    this.loading = true;
    this.fuelPurchaseService.getTrucks().subscribe({
      next: (response) => {
        this.trucks = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
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
      },
      error: (error) => {
        console.error('Error loading fuel cards:', error);
        this.loading = false;
      }
    });
  }
  
  onSubmit(): void {
    if (this.purchaseForm.valid) {
      const formData = this.purchaseForm.value as FuelPurchaseCreateDto;
      this.formSubmit.emit(formData);
    } else {
      this.purchaseForm.markAllAsTouched();
    }
  }
  
  onCancel(): void {
    this.cancelEdit.emit();
  }
}