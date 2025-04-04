// src/app/shared/types/fuel.interface.ts
export interface Plant {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  export interface FuelCard {
    _id?: string;
    name: string;
    description: string;
    balance: number;
    plantId?: string | Plant;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }
  
  export interface FuelCardResponse {
    success: boolean;
    data: FuelCard[];
  }
  
  export interface FuelCardCreateDto {
    name: string;
    description: string;
    balance: number;
    plantId: string;
  }
  
  export interface Truck {
    _id: string;
    truckNumber: string;
  }
  
  export interface TruckResponse {
    success: boolean;
    data: Truck[];
  }
  
  export interface FuelPurchase {
    _id?: string;
    truckId: string | Truck;
    fuelCardId: string | any;
    amount: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }
  
  export interface FuelPurchaseResponse {
    success: boolean;
    data: FuelPurchase[];
  }
  
  export interface FuelPurchaseCreateDto {
    truckId: string;
    fuelCardId: string;
    amount: number;
  }