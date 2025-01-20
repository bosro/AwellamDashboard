export type ClaimStatus = 'pending' | 'processing' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Claim {
  id: number;
  claimNumber: string;
  customerName: string;
  date: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: ClaimStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface ClaimsResponse {
  data: Claim[];
  total: number;
}

export interface ClaimsFilter {
  searchTerm?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: ClaimStatus;
  paymentStatus?: PaymentStatus;
  amountRange?: {
    min: number;
    max: number;
  };
  page?: number;
  pageSize?: number;
}