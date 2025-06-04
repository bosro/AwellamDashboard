import { Component, OnInit } from '@angular/core';
import { FuelCard, FuelPurchase } from '../../../../shared/types/fuel.interface';
import { FuelCardService } from '../../../../services/fuel-card.service';
import { FuelPurchaseService } from '../../../../services/fuel-purchase.service';

@Component({
  selector: 'app-fuel-dashboard',
  templateUrl: './fuel-dashboard.html'
})
export class FuelDashboardComponent implements OnInit {
  fuelCards: FuelCard[] = [];
  fuelPurchases: FuelPurchase[] = [];
  totalBalance = 0;
  totalPurchases = 0;
  isLoading = true;
  
  constructor(
    private fuelCardService: FuelCardService,
    private fuelPurchaseService: FuelPurchaseService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  private loadData(): void {
    this.isLoading = true;
    
    // Load fuel cards
    this.fuelCardService.getFuelCards().subscribe({
      next: (response) => {
        this.fuelCards = response.data;
        this.totalBalance = this.calculateTotalBalance();
      },
      error: (error) => {
        console.error('Error loading fuel cards:', error);
      }
    });
    
    // Load fuel purchases
    this.fuelPurchaseService.getFuelPurchases().subscribe({
      next: (response) => {
        this.fuelPurchases = response.data;
        this.totalPurchases = this.calculateTotalPurchases();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading fuel purchases:', error);
        this.isLoading = false;
      }
    });
  }
  
  private calculateTotalBalance(): number {
    return this.fuelCards.reduce((total, card) => total + card.balance, 0);
  }
  
  private calculateTotalPurchases(): number {
    return this.fuelPurchases.reduce((total, purchase) => total + purchase.amount, 0);
  }
  
  // Get top 5 recent purchases
  get recentPurchases(): any[] {
    return [...this.fuelPurchases]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);
  }
}