import { OrderProduct } from './order-product';

export interface OrderDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  status: string;
  zipCode: string;
  country: string;
  state: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  buyerName: string | null;
  orderItems: OrderProduct[];
}
