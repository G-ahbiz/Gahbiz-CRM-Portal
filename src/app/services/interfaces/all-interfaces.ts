export interface ordersInterface {
  id: number;
  orderId: string;
  date: string;
  customer: string;
  total: number;
  status: string;
  locations: string;
  paymentMethod: string;
}

export interface CardsInterface {
  title: string;
  value: number;
  icon: string;
  bgColor: string;
  rating: number;
  ratingStatues: string;
}
