export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    items: OrderItem[];
    shipping: {
      address: Address;
      method: string;
      cost: number;
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: Date;
    };
    billing: {
      address: Address;
      paymentMethod: string;
      paymentStatus: PaymentStatus;
      transactionId?: string;
    };
    pricing: {
      subtotal: number;
      tax: number;
      shipping: number;
      discount: number;
      total: number;
    };
    status: OrderStatus;
    notes: OrderNote[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      source: OrderSource;
      ipAddress?: string;
    };
  }
  
  export interface OrderItem {
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    price: number;
    discount?: number;
    tax?: number;
    total: number;
    status: OrderItemStatus;
    metadata?: {
      [key: string]: any;
    };
    image?: string
  }
  
  export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }
  
  export interface OrderNote {
    id: string;
    content: string;
    type: 'internal' | 'customer';
    createdBy: string;
    createdAt: Date;
  }
  
  export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    ON_HOLD = 'on_hold'
  }
  
  export enum OrderItemStatus {
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
  }
  
  export enum PaymentStatus {
    PENDING = 'pending',
    AUTHORIZED = 'authorized',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    PARTIALLY_REFUNDED = 'partially_refunded'
  }
  
  export enum OrderSource {
    WEBSITE = 'website',
    MOBILE_APP = 'mobile_app',
    PHONE = 'phone',
    IN_STORE = 'in_store',
    MARKETPLACE = 'marketplace'
  }
  

  