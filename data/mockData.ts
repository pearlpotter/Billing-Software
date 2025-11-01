
import { Product, Customer, CustomerType } from '../types';

export const initialProducts: Product[] = [
  { id: 'prod1', itemCode: 'KB001', name: 'Wireless Keyboard', stock: 50, retailPrice: 45, wholesalePrice: 35, description: 'A sleek and silent wireless keyboard.' },
  { id: 'prod2', itemCode: 'MS002', name: 'Ergonomic Mouse', stock: 75, retailPrice: 30, wholesalePrice: 22, description: 'A comfortable mouse for all-day use.' },
  { id: 'prod3', itemCode: 'MN003', name: '27-inch 4K Monitor', stock: 20, retailPrice: 350, wholesalePrice: 300, description: 'Crystal clear 4K resolution monitor.' },
  { id: 'prod4', itemCode: 'WC004', name: '1080p Webcam', stock: 40, retailPrice: 60, wholesalePrice: 48, description: 'High-definition webcam for video calls.' },
  { id: 'prod5', itemCode: 'HS005', name: 'Noise-Cancelling Headphones', stock: 30, retailPrice: 120, wholesalePrice: 95, description: 'Immersive sound with active noise cancellation.' },
  { id: 'prod6', itemCode: 'LP006', name: 'Laptop Stand', stock: 100, retailPrice: 25, wholesalePrice: 18, description: 'Adjustable aluminum laptop stand.' },
];

export const initialCustomers: Customer[] = [
  { id: 'cust1', name: 'John Doe (Retail)', type: CustomerType.RETAIL, phone: '123-456-7890', creditLimit: 0, outstandingBalance: 0 },
  { id: 'cust2', name: 'Tech Solutions Inc (Wholesale)', type: CustomerType.WHOLESALE, phone: '987-654-3210', creditLimit: 5000, outstandingBalance: 1250.50 },
  { id: 'cust3', name: 'Jane Smith (Retail)', type: CustomerType.RETAIL, phone: '555-555-5555', creditLimit: 500, outstandingBalance: 75.20 },
  { id: 'cust4', name: 'Gadget World (Wholesale)', type: CustomerType.WHOLESALE, phone: '111-222-3333', creditLimit: 10000, outstandingBalance: 0 },
];
