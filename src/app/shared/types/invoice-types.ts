export interface Product {
  _id: string;
  name: string;
  costprice: number;
  inStock: boolean;
  totalStock: number;
  plantId: {
    _id: string;
    name: string;
  };
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  plantName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  amount: number;
}

export interface InvoiceFormData {
  customerName: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface CompanyInfo {
  name: string;
  poBox: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface SaveInvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  customer: {
    name: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
}