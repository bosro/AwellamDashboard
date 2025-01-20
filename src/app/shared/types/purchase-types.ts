export type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

export interface StatusClassMap {
  pending: string;
  completed: string;
  cancelled: string;
}