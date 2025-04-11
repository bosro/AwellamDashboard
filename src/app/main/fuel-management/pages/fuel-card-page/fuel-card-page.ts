import { Component, OnInit } from '@angular/core';
import { FuelCard, FuelCardCreateDto } from '../../../../shared/types/fuel.interface';
import { FuelCardService } from '../../../../services/fuel-card.service';

@Component({
  selector: 'app-fuel-card-page',
  templateUrl: './fuel-card-page.html'
})
export class FuelCardPageComponent implements OnInit {
  fuelCards: FuelCard[] = [];
  selectedCard: FuelCard | null = null;
  isLoading = false;
  showForm = false;
  editMode = false;
  
  constructor(private fuelCardService: FuelCardService) {}
  
  ngOnInit(): void {
    this.loadFuelCards();
  }
  
  loadFuelCards(): void {
    this.isLoading = true;
    this.fuelCardService.getFuelCards().subscribe({
      next: (response) => {
        this.fuelCards = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading fuel cards:', error);
        this.isLoading = false;
      }
    });
  }
  
  onCreateNew(): void {
    this.selectedCard = null;
    this.editMode = false;
    this.showForm = true;
  }
  
  onEditCard(card: FuelCard): void {
    this.selectedCard = card;
    this.editMode = true;
    this.showForm = true;
  }
  
  onDeleteCard(id: string): void {
    if (confirm('Are you sure you want to delete this fuel card?')) {
      this.isLoading = true;
      this.fuelCardService.deleteFuelCard(id).subscribe({
        next: () => {
          this.loadFuelCards();
        },
        error: (error) => {
          console.error('Error deleting fuel card:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  onFormSubmit(formData: FuelCardCreateDto): void {
    this.isLoading = true;
    
    if (this.editMode && this.selectedCard?._id) {
      this.fuelCardService.updateFuelCard(this.selectedCard._id, formData).subscribe({
        next: () => {
          this.loadFuelCards();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating fuel card:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.fuelCardService.createFuelCard(formData).subscribe({
        next: () => {
          this.loadFuelCards();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating fuel card:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  closeForm(): void {
    this.showForm = false;
    this.selectedCard = null;
    this.editMode = false;
  }
}