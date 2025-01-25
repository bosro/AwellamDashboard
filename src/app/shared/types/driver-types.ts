// src/app/shared/types/driver.types.ts

export interface Truck {
    _id: string;
    truckNumber: string;
    capacity: number;
    status: 'active' | 'inactive';
    driver?: string;
  }
  
  export interface Driver {
    _id: string;
    name: string;
    phoneNumber: string;
    licenseNumber: string;
    truck: Truck | null;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DriverResponse {
    message: string;
    drivers: Driver[];
  }
  
  export interface CreateDriverDto {
    name: string;
    phoneNumber: string;
    licenseNumber: string;
    truckId?: string;
  }
  
  export interface UpdateDriverDto {
    name?: string;
    phoneNumber?: string;
    truckId?: string;
  }