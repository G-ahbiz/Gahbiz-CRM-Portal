export interface AllInterfaces {
  ordersInterface: {
    id: number;
    orderId: string;
    date: string;
    customer: string;
    total: number;
    status: string;
    locations: string;
    paymentMethod: string;
  }[];
}
