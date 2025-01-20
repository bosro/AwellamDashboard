import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CreateInventoryItem } from '../shared/types/inventory-types';

export interface InventoryItem {
  id: number;
  stockType: string;  // e.g., tires, oils, rims, batteries
  itemName: string;
  quantity: number;
  minimumQuantity: number;
  location: string;
  purchaseDate: string;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  unitPrice: number;
  supplier?: string;
}

export interface StockDisbursement {
  id?: number;
  inventoryItemId: number;
  quantity: number;
  disbursementDate: string;
  truckId?: number;
  requestedBy: string;
  approvedBy?: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
}



@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}


  getInventoryItems(params?: any): Observable<{ data: InventoryItem[], total: number }> {
    return this.http.get<{ data: InventoryItem[], total: number }>(
      `${this.apiUrl}/items`, 
      { params }
    );
  }

  getInventoryItemById(id: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/items/${id}`);
  }

  createInventoryItem(item: CreateInventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/items`, item);
  }

  updateInventoryItem(id: number, item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/items/${id}`, item);
  }

  deleteInventoryItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`);
  }  

 
  // Stock Disbursement Operations
  getDisbursements(params?: any): Observable<{ data: StockDisbursement[], total: number }> {
    return this.http.get<{ data: StockDisbursement[], total: number }>(
      `${this.apiUrl}/disbursements`,
      { params }
    );
  }

  createDisbursement(disbursement: Omit<StockDisbursement, 'id'>): Observable<StockDisbursement> {
    return this.http.post<StockDisbursement>(`${this.apiUrl}/disbursements`, disbursement);
  }

  updateDisbursementStatus(id: number, status: string): Observable<StockDisbursement> {
    return this.http.patch<StockDisbursement>(
      `${this.apiUrl}/disbursements/${id}`,
      { status }
    );
  }

  // Export Operations
  exportInventory(format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${format}`, { responseType: 'blob' });
  }

  exportDisbursements(format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/disbursements/export/${format}`, { responseType: 'blob' });
  }

  // Stock Level Reports
  getLowStockItems(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/low-stock`);
  }

  getStockMovementReport(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/movement-report`, { params });
  }


}