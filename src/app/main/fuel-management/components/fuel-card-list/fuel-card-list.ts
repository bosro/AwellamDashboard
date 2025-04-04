import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FuelCard } from '../../../../shared/types/fuel.interface';

@Component({
  selector: 'app-fuel-card-list',
  templateUrl: './fuel-card-list.html'
})
export class FuelCardListComponent {
  @Input() fuelCards: FuelCard[] = [];
  @Input() loading = false;
  @Output() editCard = new EventEmitter<FuelCard>();
  @Output() deleteCard = new EventEmitter<string>();
  
  onEdit(card: FuelCard): void {
    this.editCard.emit(card);
  }
  
  onDelete(id: string): void {
    if (id) {
      this.deleteCard.emit(id);
    }
  }
}