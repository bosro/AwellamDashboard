// src/app/shared/types/inventory.types.ts
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type DisbursementStatus = 'pending' | 'approved' | 'rejected';

export interface InventoryItem {
  id: number;
  itemName: string;
  stockType: string;  // e.g., tires, oils, rims, batteries
  quantity: number;
  minimumQuantity: number;
  location: string;
  purchaseDate: string;
  lastUpdated: string;
  status: StockStatus;
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
  status: DisbursementStatus;
}

export interface CreateInventoryItem extends Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'> {
  id?: number;
  status?: StockStatus;
}

export type CreateStockDisbursement = Omit<StockDisbursement, 'id' | 'approvedBy'>;