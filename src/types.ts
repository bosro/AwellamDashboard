export interface Category {
    id: string;
    name: string;
    products: Product[];
  }
  
  export interface Venue {
    id: string;
    name: string;
    categories: Category[];
  }
  
   export interface Product {
    _id: string;
    id: string;
    name: string;
    price: number;
    description?: string;
   }
  
   export interface MenuItem {
  [x: string]: any;
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'Ice Cream' | 'Gelato' | 'Sorbet' | 'Frozen Yogurt' | 'Toppings' | 'Specials';
    image: string;
    available: boolean;
    ingredients: string[];
    nutritionalInfo?: {
      calories: number;
      allergens: string[];
    };
    featured: boolean;
    seasonal: boolean;
   }
  
   export interface Order {
    orderId: string;
    date: string;
    time: string;
    customerName: string;
    location: string;
    amount: number;
    status: 'PENDING' | 'DELIVERED' | 'CANCELED' | 'Completed' | 'Processing' | 'Pending' | 'Cancelled';
    items: { name: string; quantity: number; price: number; total: number }[];
    customerDetails: {
      email: string;
      phone: string;
      address: string;
    };
    paymentMethod: string;
   }
  export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  }
  
  export interface Customer {
    state: string;
    postalCode: string;
    country: string;
    city: string;
    street: string;
    fullName: string;
    _id: string;
    id: string;
    name: string;
    email: string;
    phone: string;
    secondaryPhone?: string;
    address: Address;
    joinDate: Date;
    lastVisit?: Date;
    totalOrders: number;
  }
  
  // types.ts
  export interface CustomerResponse {
    status: number;
    customers: BackendCustomer[];
  }
  
  export interface BackendCustomer {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    secondaryPhone?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
  
  
  export interface CustomerFormData {
    fullName: string;
    email: string;
    phone: string;
    secondaryPhone?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    password?: string;
  }


  // app.interfaces.ts

/*********************
 * Enums
 *********************/



/*********************
 * Interfaces
 *********************/



// Transaction Interface
export interface Transaction {
  _id?: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  bankName?: string; // Add this field
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  Reference:'';
  // date:number
}

// API Response for Fetching Transactions
export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
}

// API Response for a Single Transaction
export interface SingleTransactionResponse {
  success: boolean;
  data: Transaction;
}

// API Response for Fetching Customers
export interface CustomersResponse {
  success: boolean;
  data: Customer[];
}

// API Response for a Single Customer
export interface SingleCustomerResponse {
  success: boolean;
  data: Customer;
}

export enum TransactionType {
  PAYMENT = "PAYMENT",
  // CREDIT_ADDED='CREDIT_ADDED',
  CREDIT_NOTE='CREDIT_NOTE',
  // CREDIT_REMOVED='CREDIT_REMOVED',
  DEBIT_NOTE = 'DEBIT_NOTE',
  // DEDIT_NOTE_REMOVED = 'DEBIT_NOTE_REMOVED'
}

export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  MOBILE_PAYMENT = "mobile_money",
}

export enum BankName {
  FIRST_ATLANTIC_BANK = "First Atlantic Bank",
  GCB_BANK = "GCB Bank",
  BANK_OF_AFRICA = "Bank of Africa",
  STANBIC_BANK = "Stanbic Bank",
  NIB_BANK = "NIB Bank",
  ECOBANK_AWELLAM_ENTERPRISE = "Ecobank - Awellam Enterprise",
  ECOBANK_INSHIRAPA_CONSTRUCTIONS = "Ecobank - Inshirapa Constructions",
}