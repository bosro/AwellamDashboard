export interface Customer {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  accountInfo: {
    status: CustomerStatus;
    type: CustomerType;
    registeredAt: string;
    lastLoginAt: string;
  };
  addresses: Array<{
    id: string;
    type: 'billing' | 'shipping';
    isDefault: boolean;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  billingInfo: {
    paymentMethods: Array<{
      id: string;
      type: string;
      lastFour: string;
      expiryDate: string;
      isDefault: boolean;
    }>;
  };
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    marketing: boolean;
  };
  segments: string[];
  metadata: CustomerMetadata;
}

export interface CustomerMetadata {
  notes: CustomerNote[];
  tags?: string[];
  loyaltyPoints?: number;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate: Date;
}

  export interface Address {
    id: string;
    type: 'billing' | 'shipping';
    isDefault: boolean;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
  
  export interface PaymentMethod {
    id: string;
    type: 'credit_card' | 'paypal' | 'bank_account';
    isDefault: boolean;
    lastFour?: string;
    expiryDate?: string;
    holderName: string;
  }
  
  export interface CustomerNote {
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    type: 'internal' | 'customer' | 'system';
  }

 
  
  // export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'pending';
  
  
  export enum CustomerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked',
    PENDING = 'pending'
  }
  
  export enum CustomerType {
    REGULAR = 'regular',
    VIP = 'vip',
    WHOLESALE = 'wholesale',
    BUSINESS = 'business'
  }
  
  export interface CustomerSegment {
    id: string;
    name: string;
    description: string;
    criteria: SegmentCriteria[];
    customerCount: number;
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      createdBy: string;
    };
  }
  
  export interface SegmentCriteria {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
    value: any;
  }
  

  