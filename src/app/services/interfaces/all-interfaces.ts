export interface ordersInterface {
  id: number;
  orderId: string;
  date: string;
  customer: string;
  total: number;
  status: string;
  locations: string;
  paymentMethod: string;
  clientId: number;
}

export interface CardsInterface {
  title: string;
  value: number;
  icon: string;
  bgColor: string;
  rating: number;
  ratingStatues: string;
}

export interface customersDetailsInterface {
  id: number;
  fullName: string;
  userName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  profileImageUrl: string;
  gender: string;
  nationalId: string;
  country: string;
  state: string;
  postalCode: string;
  userType: string;
}
