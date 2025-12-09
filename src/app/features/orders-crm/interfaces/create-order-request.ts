import { OrderServiceData } from './order-service-data';

export interface CreateOrderRequest {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  country: string;
  state: string;
  city: string;
  paymentMethod: 'CreditCard' | 'CashOnDelivery' | 'PayPal' | 'BankTransfer';
  services: OrderServiceData[];
  note?: string;
}
