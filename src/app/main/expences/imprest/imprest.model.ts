// src/app/models/imprest.model.ts

export interface Imprest {
    _id?: string;
    date: string | Date;
    amount: number;
    description: string;
    currentBalance?: number;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  plantId?: string;
  }
  
  export interface Expense {
    _id?: string;
    expenseType: string | null;
    accountType: string;
    amount: number;
    date: string | Date;
    recipient: string;
    description: string;
    status: string;
    approvedBy: string | null;
    imprestId: string;
    createdAt?: string;
    updatedAt?: string;
    truckId?: TruckDetail;
  }
  
  export interface TruckDetail {
    _id: string;
    truckNumber: string;
    driver: Driver;
  }
  
  export interface Driver {
    _id: string;
    name: string;
  }
  
  export interface ImprestDetail extends Imprest {
    expenses: Expense[];
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
  }