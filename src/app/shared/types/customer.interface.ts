export interface Customer {
  // [x: string]: Customer | undefined;
  _id: string;
  fullName: string;
  email: string;
  address: string;
  phoneNumber: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  totalOrders :number
}
