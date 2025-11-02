import { Injectable } from '@angular/core';
import { CardsInterface, ordersInterface } from './interfaces/all-interfaces';

@Injectable({
  providedIn: 'root',
})
export class AllData {

  // Orders Data
  ordersTabelData: ordersInterface[] = [
    { id: 1, orderId: '67821', date: '2025-01-01', customer: 'Karin Daniel', total: 90, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 2, orderId: '58143', date: '2025-01-01', customer: 'Jenna Will', total: 680, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 3, orderId: '76542', date: '2025-01-01', customer: 'Ashley Rio', total: 380, status: 'Cancelled', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 4, orderId: '650789', date: '2025-01-01', customer: 'Jenna Will', total: 300, status: 'Delivered', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 5, orderId: '87654', date: '2025-01-01', customer: 'Ashley Rio', total: 420, status: 'Delivered', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 6, orderId: '98765', date: '2025-01-01', customer: 'Karin Daniel', total: 510, status: 'Cancelled', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    // { id: 7, orderId: '12345', date: '2025-01-01', customer: 'Jenna Will', total: 100, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    // { id: 8, orderId: '23456', date: '2025-01-01', customer: 'Ashley Rio', total: 280, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Paypal' },
    // { id: 9, orderId: '34567', date: '2025-01-01', customer: 'Karin Daniel', total: 360, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Paypal' },
    // { id: 10, orderId: '45678', date: '2025-01-01', customer: 'Jenna Will', total: 210, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Paypal' }
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

  // Customers Data

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
}
