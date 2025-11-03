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
  servicesData: any[] = [];

  currentCustomerId: number | undefined;
  currentCustomer: customersDetailsInterface | undefined;
  currentClientPayment: clientPaymentsInterface | undefined;
  currentServiceData: any | undefined;
  servicesHistory: any[] = [];
  servicesTotalQuantity: number = 0;
  servicesTotalPrice: number = 0;
  cardsData: any[] = [];
  constructor(private allData: AllData, private translate: TranslateService) { }


  ngOnInit() {
    this.getOrderDetails();
    this.getCurrentOrder();
    this.getCustomersDetails();
    this.getCurrentCustomer();
    this.getClientPayments();
    this.getCurrentClientPayment();
    this.getServicesData();
    this.getCardsData();
    this.getServicesHistory();
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
      console.log(`current customer:`, this.currentCustomerId);
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


  getServicesData() {
    this.servicesData = this.allData.getServicesData();
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
    this.currentServiceData = this.servicesData.find(service => service.id === this.currentOrder?.serviceID);
    console.log(`current service data:`, this.currentServiceData);

    this.servicesTotalQuantity = this.servicesHistory.reduce((total, service) => total + service.quantity, 0);
    this.servicesTotalPrice = this.servicesHistory.reduce((total, service) => total + service.total, 0);
  }

  goBack() {
    window.history.back();
  }
}
