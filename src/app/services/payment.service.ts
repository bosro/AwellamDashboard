export interface Plant {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}


export interface CreateSocRequest {
  socNumber: string;
  quantity: number;
  plantId: string;
  categoryId: string;
  productId: string;
  orderType: string;
}

export interface SocResponse {
  message: string;
  socNumber: {
    socNumber: string;
    quantity: number;
    plantId: string;
    categoryId: string;
    productId: string;
    orderType: string;
    status: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AssignDriverResponse {
  message: string;
  soc: {
    _id: string;
    status: string;
    driverId: string;
    updatedAt: string;
  };
}

export interface UpdateSocRequest {
  socNumber: string;
  quantity: number;
  plantId: string;
  categoryId: string;
  productId: string;
  orderType: string;
  status: string;
}

export interface UpdateSocResponse {
  message: string;
  soc: {
    _id: string;
    socNumber: string;
    quantity: number;
    plantId: string;
    categoryId: string;
    productId: string;
    orderType: string;
    status: string;
    updatedAt: string;
  };
}

export interface DeleteSocResponse {
  message: string;
}

export interface Category {
  _id: string;
  name: string;
  plantId: string;
  createdAt: string;
  updatedAt: string;
}

export enum OrderType {
  GUARANTEE_ORDER = "GUARANTEE ORDER ",
  SPECIAL_GUARANTEE_ORDER= "SPECIAL GUARANTEE ORDER",
NORMAL_CHÈQUE_ORDER= "NORMAL CHÈQUE ORDER",
CASH_ORDER = "CASH ORDER",
BORROWED_ORDER= "BORROWED_ORDER"
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  inStock: boolean;
  totalStock: number;
  categoryId: string;
  plantId: string;
  destination: string;
  rates: number;
}

export interface SocNumber {
  destinationId: any;
  _id: string;
  socNumber: string;
  quantity: number;
  plantId: Plant;
  categoryId: Category;
  productId: Product;
  status: string;
  orderType: string;
  createdAt: string;
  updatedAt: string;
  totalquantity: number;
  assignedTruck: {
    _id: string,
    truckNumber: string,
    driver:{
      name: string,
      phoneNumber: number
    }
  };
  assignedOrder:{
    _id: string ,
    customerId : {
      _id:string, 
      fullName: string,
      phoneNumber: string,
      address: string
    }

  }
}

export interface PaymentReference {
  truckId(truckId: any, socId: string): unknown;
  _id: string;
  paymentRef: string;
  plantId: Plant;
  socNumbers: SocNumber[];
  createdAt: string;
  updatedAt: string;
  orderType: string;
  chequeNumber: number;
}




export interface PaymentResponse {
  message: string;
  paymentReferences: PaymentReference[];
}

export interface PaymentDetailResponse {
  message: string;
  paymentReference: PaymentReference;
}

// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
// import { PaymentReference, Plant, Category, Product } from '../models/interfaces';






@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getPaymentReferences(): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/payment/get`);
  }

  getPaymentReferenceDetails(id: string): Observable<PaymentDetailResponse> {
    return this.http.get<PaymentDetailResponse>(`${this.apiUrl}/payment/get/${id}`);
  }

  updatePaymentReference(payment: PaymentReference): Observable<PaymentReference> {
    return this.http.put<PaymentReference>(`${this.apiUrl}/payment/edit/${payment._id}`, payment);
  }

  deletePaymentReference(paymentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payment/delete/${paymentId}`);
  }


  assignSocToDriver(truckId: string, socId: string): Observable<AssignDriverResponse> {
    return this.http.post<AssignDriverResponse>(
      `${this.apiUrl}/soc/trucks/${truckId}/assign-soc/${socId}`,
      {}
    );
  }


  createSoc(paymentRefId: string, socData: CreateSocRequest): Observable<SocResponse> {
    return this.http.post<SocResponse>(
      `${this.apiUrl}/soc/create/${paymentRefId}`,
      socData
    );
  }
  

  getPlants(): Observable<{ plants: Plant[] }> {
    return this.http.get<{ plants: Plant[] }>(`${this.apiUrl}/plants/get`);
  }

  getCategoriesByPlant(plantId: string): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/category/plants/${plantId}`);
  }
  getProductByPlant(plantId: string): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[]}>(`${this.apiUrl}/products/get/${plantId}`);
  }

  getProductsByCategory(categoryId: string): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(`${this.apiUrl}/products/category/${categoryId}`);
  }
  createPaymentReference(data: {
    paymentRef: string;
    plantId: string;
    orderType: OrderType;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/create`, data);
  }

  updateSoc(
    paymentRefId: string, 
    socId: string, 
    socData: UpdateSocRequest
  ): Observable<UpdateSocResponse> {
    return this.http.put<UpdateSocResponse>(
      `${this.apiUrl}/soc/edit/${socId}`,
      socData
    );
  }

  deleteSoc(paymentRefId: string, socId: string): Observable<DeleteSocResponse> {
    return this.http.delete<DeleteSocResponse>(
      `${this.apiUrl}/soc/delete/${socId}`
    );
  }


  createSocNumber(paymentRefId: string, socData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/soc/create/${paymentRefId}`, socData);
  }
}