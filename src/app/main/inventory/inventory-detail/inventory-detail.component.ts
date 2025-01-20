import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService, InventoryItem, StockDisbursement } from '../../../services/inventory.service'


export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type DisbursementStatus = 'pending' | 'approved' | 'rejected';


@Component({
  selector: 'app-inventory-details',
  templateUrl: './inventory-detail.component.html',
  styleUrls: ['./inventory-detail.component.scss']
})
export class InventoryDetailsComponent implements OnInit {
  item!: InventoryItem;
  disbursements: StockDisbursement[] = [];
  loading = false;
  chartData: any[] = [];

  constructor(
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadItemDetails(id);
    this.loadDisbursements(id);
    this.loadStockMovements(id);
  }

  loadItemDetails(id: number): void {
    this.loading = true;
    this.inventoryService.getInventoryItemById(id).subscribe({
      next: (data) => {
        this.item = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading item details:', error);
        this.loading = false;
      }
    });
  }

  loadDisbursements(id: number): void {
    this.inventoryService.getDisbursements({ inventoryItemId: id }).subscribe({
      next: (response) => {
        this.disbursements = response.data;
      }
    });
  }

  loadStockMovements(id: number): void {
    this.inventoryService.getStockMovementReport({ itemId: id }).subscribe({
      next: (data) => {
        this.chartData = this.transformChartData(data);
      }
    });
  }

  private transformChartData(data: any[]): any[] {
    // Transform data for stock movement chart
    return data.map(item => ({
      date: item.date,
      quantity: item.quantity,
      type: item.type
    }));
  }

  downloadStockReport(): void {
    this.inventoryService.exportInventory('pdf').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stock-report-${this.item.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  getStatusClass(status: StockStatus | DisbursementStatus): string {
    const statusClasses = {
      // Stock status classes
      'in-stock': 'bg-green-100 text-green-800',
      'low-stock': 'bg-yellow-100 text-yellow-800',
      'out-of-stock': 'bg-red-100 text-red-800',
      // Disbursement status classes
      'pending': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };

    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

}