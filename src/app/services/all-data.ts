import { Injectable } from '@angular/core';
import { CardsInterface, clientPaymentsInterface, customersDetailsInterface, Invoice, ordersInterface } from './interfaces/all-interfaces';

@Injectable({
  providedIn: 'root',
})
export class AllData {

  // Orders Data
  ordersTabelData: ordersInterface[] = [
    { id: 1, orderId: '67821', serviceID: 1, date: '2025-11-01', quantity: 2, cutomerID: 1, customer: 'Karin Daniel', total: 90, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 1 },
    { id: 2, orderId: '58143', serviceID: 2, date: '2025-10-01', quantity: 3, cutomerID: 2, customer: 'Jenna Will', total: 120, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 2 },
    { id: 3, orderId: '76542', serviceID: 3, date: '2025-09-01', quantity: 1, cutomerID: 3, customer: 'Ashley Rio', total: 100, status: 'Cancelled', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 3 },
    { id: 4, orderId: '650789', serviceID: 4, date: '2025-08-01', quantity: 2, cutomerID: 1, customer: 'Jenna Will', total: 240, status: 'Delivered', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 1 },
    { id: 5, orderId: '87654', serviceID: 5, date: '2025-07-01', quantity: 2, cutomerID: 2, customer: 'Ashley Rio', total: 300, status: 'Delivered', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 2 },
    { id: 6, orderId: '98765', serviceID: 6, date: '2025-06-01', quantity: 1, cutomerID: 3, customer: 'Karin Daniel', total: 600, status: 'Cancelled', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 3 },
    { id: 7, orderId: '12345', serviceID: 7, date: '2025-05-01', quantity: 1, cutomerID: 1, customer: 'Jenna Will', total: 700, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 1 },
    { id: 8, orderId: '23456', serviceID: 8, date: '2025-04-01', quantity: 1, cutomerID: 2, customer: 'Ashley Rio', total: 800, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Paypal', clientId: 2 },
    { id: 9, orderId: '34567', serviceID: 9, date: '2025-03-01', quantity: 1, cutomerID: 3, customer: 'Karin Daniel', total: 900, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Paypal', clientId: 3 },
    { id: 10, orderId: '45678', serviceID: 9, date: '2025-02-01', quantity: 1, cutomerID: 1, customer: 'Jenna Will', total: 900, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Paypal', clientId: 1 },
    { id: 11, orderId: '12345', serviceID: 5, date: '2025-01-01', quantity: 1, cutomerID: 2, customer: 'Jenna Will', total: 100, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Credit Card', clientId: 2 },
    { id: 12, orderId: '23456', serviceID: 1, date: '2025-01-01', quantity: 1, cutomerID: 3, customer: 'Ashley Rio', total: 280, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Paypal', clientId: 3 },
    { id: 13, orderId: '34567', serviceID: 4, date: '2025-01-01', quantity: 1, cutomerID: 1, customer: 'Karin Daniel', total: 360, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Paypal', clientId: 1 },
    { id: 14, orderId: '45678', serviceID: 2, date: '2025-01-01', quantity: 1, cutomerID: 2, customer: 'Jenna Will', total: 210, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Paypal', clientId: 2 },
  ];

  getOrdersTabelData() {
    return this.ordersTabelData;
  }

  ordersCardsData: CardsInterface[] = [
    {
      title: 'Total Orders',
      value: 569,
      icon: 'cube',
      bgColor: 'card-blue',
      rating: 2,
      ratingStatues: 'up'
    },
    {
      title: 'Confirmed Orders',
      value: 380,
      icon: 'checkCircle',
      bgColor: 'card-green',
      rating: 4,
      ratingStatues: 'up',
    },
    {
      title: 'Pending Orders',
      value: 80,
      icon: 'clock',
      bgColor: 'card-yellow',
      rating: 1,
      ratingStatues: 'down',
    },
    {
      title: 'Cancelled Orders',
      value: 100,
      icon: 'xCircle',
      bgColor: 'card-red',
      rating: 3,
      ratingStatues: 'down',
    },
  ];

  getOrdersCardsData() {
    return this.ordersCardsData;
  }

  // Services Data
  servicesData: any[] = [
    {
      id: 1,
      name: "Service 1",
      price: 45,
    },
    {
      id: 2,
      name: "Service 2",
      price: 60,
    },
    {
      id: 3,
      name: "Service 3",
      price: 100,
    },
    {
      id: 4,
      name: "Service 4",
      price: 120,
    },
    {
      id: 5,
      name: "Service 5",
      price: 150,
    },
    {
      id: 6,
      name: "Service 6",
      price: 600,
    },
    {
      id: 7,
      name: "Service 7",
      price: 700,
    },
    {
      id: 8,
      name: "Service 8",
      price: 800,
    },
    {
      id: 9,
      name: "Service 9",
      price: 900,
    },
  ]

  getServicesData() {
    return this.servicesData;
  }

  // Sales Agent Data
  salesAgentCardsData: CardsInterface[] = [
    {
      title: 'Total Agents',
      value: 100,
      icon: 'totalAgents',
      bgColor: 'card-blue',
      rating: 2,
      ratingStatues: 'up'
    },
    {
      title: 'Active Members',
      value: 380,
      icon: 'activeMembers',
      bgColor: 'card-green',
      rating: 4,
      ratingStatues: 'up',
    },
    {
      title: 'Inactive Members',
      value: 10,
      icon: 'inactiveMembers',
      bgColor: 'card-yellow',
      rating: 1,
      ratingStatues: 'down',
    },
    {
      title: 'Total Leads',
      value: 5000,
      icon: 'totalLeads',
      bgColor: 'card-red',
      rating: 3,
      ratingStatues: 'down',
    },
  ]

  getSalesAgentCardsData() {
    return this.salesAgentCardsData;
  }

  // Leads Data
  leadsCardsData: CardsInterface[] = [
    {
      title: 'Total Leads',
      value: 100,
      icon: 'totalLeads',
      bgColor: 'card-blue',
      rating: 2,
      ratingStatues: 'up'
    },
    {
      title: 'Qualified',
      value: 380,
      icon: 'qualified',
      bgColor: 'card-green',
      rating: 4,
      ratingStatues: 'up',
    },
    {
      title: 'New',
      value: 10,
      icon: 'new',
      bgColor: 'card-yellow',
      rating: 1,
      ratingStatues: 'down',
    },
    {
      title: 'Inprogress',
      value: 5000,
      icon: 'inprogress',
      bgColor: 'card-red',
      rating: 3,
      ratingStatues: 'down',
    },
  ]

  getLeadsCardsData() {
    return this.leadsCardsData;
  }

  // Invoices Data
  invoicesTabelData: Invoice[] = [
    { id: 1, customer: 'Karin Daniel', billDate: '2025-11-01', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Paid', clientId: 1 },
    { id: 2, customer: 'Jenna Will', billDate: '2025-11-02', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Partially Paid', clientId: 2 },
    { id: 3, customer: 'Ashley Rio', billDate: '2025-10-01', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Unpaid', clientId: 3 },
    { id: 4, customer: 'Karin Daniel', billDate: '2025-9-01', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Paid', clientId: 1 },
    { id: 5, customer: 'Jenna Will', billDate: '2025-10-25', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Paid', clientId: 2 },
    { id: 6, customer: 'Ashley Rio', billDate: '2025-10-20', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Paid', clientId: 3 },
    { id: 7, customer: 'Karin Daniel', billDate: '2025-01-10', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Paid', clientId: 1 },
    { id: 8, customer: 'Jenna Will', billDate: '2025-10-15', dueDate: '2025-11-01', total: 100, paymentReceived: 100, due: 0, status: 'Paid', clientId: 2 },
  ]

  getInvoicesTabelData() {
    return this.invoicesTabelData;
  }

  invoicesCardsData: CardsInterface[] = [
    {
      title: 'Total Invoices',
      value: 569,
      icon: 'totalInvoices',
      bgColor: 'card-blue',
      rating: 2,
      ratingStatues: 'up'
    },
    {
      title: 'Paid',
      value: 380,
      icon: 'paid',
      bgColor: 'card-green',
      rating: 4,
      ratingStatues: 'up',
    },
    {
      title: 'Partially Paid',
      value: 10,
      icon: 'partiallyPaid',
      bgColor: 'card-yellow',
      rating: 1,
      ratingStatues: 'down',
    },
    {
      title: 'Unpaid',
      value: 109,
      icon: 'unpaid',
      bgColor: 'card-red',
      rating: 3,
      ratingStatues: 'down',
    },
  ]

  getInvoicesCardsData() {
    return this.invoicesCardsData;
  }

  // Customers Data

  customersDetailsData: customersDetailsInterface[] = [
    {
      id: 1,
      fullName: "Karin Daniel",
      userName: "karin.daniel",
      phoneNumber: "01012345678",
      email: "karin.daniel@example.com",
      dateOfBirth: "2025-11-02",
      profileImageUrl: "https://via.placeholder.com/150",
      gender: "Female",
      nationalId: "1234567890123",
      country: "United States",
      state: "California",
      postalCode: "123456",
      userType: "Client",
    },
    {
      id: 2,
      fullName: "Jenna Will",
      userName: "jenna.will",
      phoneNumber: "01012345678",
      email: "jenna.will@example.com",
      dateOfBirth: "2025-11-02",
      profileImageUrl: "https://via.placeholder.com/150",
      gender: "Female",
      nationalId: "1234567890123",
      country: "United States",
      state: "California",
      postalCode: "123456",
      userType: "Client",
    },
    {
      id: 3,
      fullName: "Ashley Rio",
      userName: "ashley.rio",
      phoneNumber: "01012345678",
      email: "ashley.rio@example.com",
      dateOfBirth: "2025-11-02",
      profileImageUrl: "https://via.placeholder.com/150",
      gender: "Female",
      nationalId: "1234567890123",
      country: "United States",
      state: "California",
      postalCode: "123456",
      userType: "Client",
    }
  ]

  getCustomersDetailsData() {
    return this.customersDetailsData;
  }

  customersCardsData: CardsInterface[] = [
    {
      title: 'Total Customers',
      value: 569,
      icon: 'totalCustomers',
      bgColor: 'card-blue',
      rating: 2,
      ratingStatues: 'up'
    },
    {
      title: 'Clients',
      value: 380,
      icon: 'clients',
      bgColor: 'card-green',
      rating: 4,
      ratingStatues: 'up',
    },
    {
      title: 'Leads',
      value: 80,
      icon: 'leads',
      bgColor: 'card-yellow',
      rating: 4,
      ratingStatues: 'up',
    },
    {
      title: 'Users',
      value: 109,
      icon: 'users',
      bgColor: 'card-red',
      rating: 4,
      ratingStatues: 'up',
    },
  ];

  getCustomersCardsData() {
    return this.customersCardsData;
  }

  // Client Payment

  clientPaymentsData: clientPaymentsInterface[] = [
    {
      id: 1,
      clientId: 1,
      paymentMethod: "Credit Card",
      amount: 100,
      status: "Paid",
      date: "2025-11-02",
      cardNumber: "1234567890123456",
      cardHolderName: "Karin Daniel",
      cardExpirationDate: "09/27",
      cardCvv: "123",
    },
    {
      id: 2,
      clientId: 2,
      paymentMethod: "Credit Card",
      amount: 100,
      status: "Paid",
      date: "2025-11-02",
      cardNumber: "1234567890123456",
      cardHolderName: "Jenna Will",
      cardExpirationDate: "09/27",
      cardCvv: "123",
    },
    {
      id: 3,
      clientId: 3,
      paymentMethod: "Credit Card",
      amount: 100,
      status: "Paid",
      date: "2025-11-02",
      cardNumber: "1234567890123456",
      cardHolderName: "Ashley Rio",
      cardExpirationDate: "09/28",
      cardCvv: "123",
    },
    {
      id: 4,
      clientId: 4,
      paymentMethod: "Paypal",
      amount: 100,
      status: "Paid",
      date: "2025-11-02",
      cardNumber: "1234567890123456",
      cardHolderName: "Karin Daniel",
      cardExpirationDate: "09/27",
      cardCvv: "123",
    }
  ]

  getClientPaymentsData() {
    return this.clientPaymentsData;
  }
}



