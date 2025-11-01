import { Injectable } from '@angular/core';
import { AllInterfaces } from './interfaces/all-interfaces';

@Injectable({
  providedIn: 'root',
})
export class AllData {

  ordersTabelData: AllInterfaces['ordersInterface'] = [
    { id: 1, orderId: '67821', date: '2025-01-01', customer: 'Karin Daniel', total: 90, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 2, orderId: '58143', date: '2025-01-01', customer: 'Jenna Will', total: 680, status: 'Confirmed', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 3, orderId: '76542', date: '2025-01-01', customer: 'Ashley Rio', total: 380, status: 'Cancelled', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 4, orderId: '650789', date: '2025-01-01', customer: 'Jenna Will', total: 300, status: 'Delivered', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 5, orderId: '87654', date: '2025-01-01', customer: 'Ashley Rio', total: 420, status: 'Delivered', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 6, orderId: '98765', date: '2025-01-01', customer: 'Karin Daniel', total: 510, status: 'Cancelled', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 7, orderId: '12345', date: '2025-01-01', customer: 'Jenna Will', total: 100, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Credit Card' },
    { id: 8, orderId: '23456', date: '2025-01-01', customer: 'Ashley Rio', total: 280, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Paypal' },
    { id: 9, orderId: '34567', date: '2025-01-01', customer: 'Karin Daniel', total: 360, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Paypal' },
    { id: 10, orderId: '45678', date: '2025-01-01', customer: 'Jenna Will', total: 210, status: 'Pending', locations: 'LA, NY', paymentMethod: 'Paypal' }
  ];
}
