
export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Billing Staff',
}

export interface User {
  username: string;
  role: UserRole;
}

export enum CustomerType {
  RETAIL = 'Retail',
  WHOLESALE = 'Wholesale',
}

export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT = 'Credit',
}

export interface Product {
  id: string;
  itemCode: string;
  name: string;
  stock: number;
  retailPrice: number;
  wholesalePrice: number;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  phone: string;
  creditLimit: number;
  outstandingBalance: number;
}

export interface BillItem {
  productId: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerType: CustomerType;
  items: BillItem[];
  subTotal: number;
  discountPercentage: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  amountDue: number;
}

export interface Payment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  billId?: string; // Optional: link to a specific bill
}
