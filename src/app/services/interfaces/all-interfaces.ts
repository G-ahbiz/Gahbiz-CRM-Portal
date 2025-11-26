export interface ordersInterface {
  id: number;
  orderId: string;
  serviceID: number;
  date: string;
  quantity: number;
  cutomerID: number;
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

export interface clientPaymentsInterface {
  id: number;
  clientId: number;
  paymentMethod: string;
  amount: number;
  status: string;
  date: string;
  cardNumber: string;
  cardHolderName: string;
  cardExpirationDate: string;
  cardCvv: string;
}

export interface Invoice {
  id: number;
  customer: string;
  billDate: string;
  dueDate: string;
  total: number;
  paymentReceived: number;
  due: number;
  status: string;
  selected?: boolean;
  clientId: number;
}

export interface Customer {
  id: number;
  customer: string;
  phoneNumber: string;
  customerName: string;
  noOfOrders: number;
  status: string;
  assignedTo: string;
  selected?: boolean;
}

export interface SalesAgents {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  assignedTo: string;
  selected?: boolean;
}

export interface LeadsInterface {
  id: number;
  name: string;
  service: string;
  status: string;
  source: string;
  assignedTo: string;
  value: string;
  createdDate: string;
  selected?: boolean;
}
