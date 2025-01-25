export interface Order {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  customerId: Customer;
  deliveryAddress: string;
  orderItems: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  fullName: string;
  phoneNumber: number;
}

export interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
  _id: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  REFUNDED = 'Refunded'
}

export interface OrderResponse {
  message: string;
  orders: Order[];
}