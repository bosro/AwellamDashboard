import { Component, OnInit } from '@angular/core';
import { FuelPurchase, FuelPurchaseCreateDto } from '../../../../shared/types/fuel.interface';
import { FuelPurchaseService } from '../../../../services/fuel-purchase.service';
import {FuelCardFormComponent}  from '../../components/fuel-card-form/fuel-card-form'

@Component({
  selector: 'app-fuel-purchase-page',
  templateUrl: './fuel-purchase-page.html'
})
export class FuelPurchasePageComponent implements OnInit {
  fuelPurchases!: FuelPurchase[] ;
  selectedPurchase: any | null = null;
  isLoading = false;
  showForm = false;
  editMode = false;
  // FuelCardFormComponent: any
  
  constructor(private fuelPurchaseService: FuelPurchaseService) {}
  
  ngOnInit(): void {
    this.loadFuelPurchases();
  }
  
  loadFuelPurchases(): void {
    this.isLoading = true;
    this.fuelPurchaseService.getFuelPurchases().subscribe({
      next: (response) => {
        this.fuelPurchases = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading fuel purchases:', error);
        this.isLoading = false;
      }
    });
  }
  
  onCreateNew(): void {
    this.selectedPurchase = null;
    this.editMode = false;
    this.showForm = true;
  }
  
  onEditPurchase(purchase: any): void {
    this.selectedPurchase = purchase;
    this.editMode = true;
    this.showForm = true;
  }
  
  onDeletePurchase(id: string): void {
    if (confirm('Are you sure you want to delete this fuel purchase?')) {
      this.isLoading = true;
      this.fuelPurchaseService.deleteFuelPurchase(id).subscribe({
        next: () => {
          this.loadFuelPurchases();
        },
        error: (error) => {
          console.error('Error deleting fuel purchase:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  onFormSubmit(formData: any): void {
    this.isLoading = true;
    
    if (this.editMode && this.selectedPurchase?._id) {
      this.fuelPurchaseService.updateFuelPurchase(this.selectedPurchase._id, formData).subscribe({
        next: () => {
          this.loadFuelPurchases();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating fuel purchase:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.fuelPurchaseService.createFuelPurchase(formData).subscribe({
        next: () => {
          this.loadFuelPurchases();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating fuel purchase:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  closeForm(): void {
    this.showForm = false;
    this.selectedPurchase = null;
    this.editMode = false;
  }
}