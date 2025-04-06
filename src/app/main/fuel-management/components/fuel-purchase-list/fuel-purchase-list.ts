import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FuelPurchase } from '../../../../shared/types/fuel.interface';

@Component({
  selector: 'app-fuel-purchase-list',
  templateUrl: './fuel-purchase-list.html'
})
export class FuelPurchaseListComponent {
  @Input() fuelPurchases: any[] = [];
  @Input() loading = false;
  @Output() editPurchase = new EventEmitter<any>();
  @Output() deletePurchase = new EventEmitter<string>();
  
  onEdit(purchase: FuelPurchase): void {
    this.editPurchase.emit(purchase);
  }
  
  onDelete(id: string): void {
    if (id) {
      this.deletePurchase.emit(id);
    }
  }
}