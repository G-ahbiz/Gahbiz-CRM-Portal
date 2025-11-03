import { Component } from '@angular/core';
import { AllData } from '../../../../services/all-data';
import { clientPaymentsInterface, customersDetailsInterface, ordersInterface } from '../../../../services/interfaces/all-interfaces';
import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-order-details',
  imports: [TranslateModule, DatePipe],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {

  allOrders: ordersInterface[] = [];
  currentOrder: ordersInterface | undefined;
  customersDetails: customersDetailsInterface[] = [];
  clientPayments: clientPaymentsInterface[] = [];

  currentCustomerId: number | undefined;
  currentCustomer: customersDetailsInterface | undefined;
  currentClientPayment: clientPaymentsInterface | undefined;
  servicesHistory: any[] = [];
  cardsData: any[] = [];
  constructor(private allData: AllData, private translate: TranslateService) { }


  ngOnInit() {
    this.getOrderDetails();
    this.getCurrentOrder();
    this.getCustomersDetails();
    this.getCurrentCustomer();
    this.getClientPayments();
    this.getCurrentClientPayment();
    this.getCardsData();
  }

  getOrderDetails() {
    this.allOrders = this.allData.getOrdersTabelData();
  }

  getCurrentOrder() {
    let orderId = sessionStorage.getItem('orderId');
    if (orderId) {
      this.currentOrder = this.allOrders.find(order => order.id === parseInt(orderId));
    } else {
      this.currentOrder = undefined;
    }
  }

  getCurrentCustomer() {
    this.currentCustomerId = this.currentOrder?.clientId;
    if (this.currentCustomerId) {
      this.currentCustomer = this.customersDetails.find(customer => customer.id === this.currentCustomerId);
    } else {
      this.currentCustomer = undefined;
    }
  }

  getCustomersDetails() {
    this.customersDetails = this.allData.getCustomersDetailsData();
  }

  getClientPayments() {
    this.clientPayments = this.allData.getClientPaymentsData();
  }

  getCurrentClientPayment() {
    this.currentClientPayment = this.clientPayments.find(payment => payment.clientId === this.currentCustomerId);
  }

  getCardsData() {
    this.cardsData = [
      {
        customerName: this.currentCustomer?.fullName,
        customerEmail: this.currentCustomer?.email,
        customerPhone: this.currentCustomer?.phoneNumber,
        customerPaymentMethod: this.currentClientPayment?.paymentMethod,
        customerPaymentExpirationDate: this.currentClientPayment?.cardExpirationDate,
        cutomerAddress: this.currentCustomer?.state,
        customerPostalCode: this.currentCustomer?.postalCode,
        orderStatus: this.currentOrder?.status,
      }
    ]
  }

  getServicesHistory() {
    this.servicesHistory = this.allOrders.filter(order => order.clientId === this.currentCustomerId);
  }

  goBack() {
    window.history.back();
  }
}
