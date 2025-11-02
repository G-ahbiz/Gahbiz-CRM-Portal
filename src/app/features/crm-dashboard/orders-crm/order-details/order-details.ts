import { Component } from '@angular/core';
import { AllData } from '../../../../services/all-data';
import { customersDetailsInterface, ordersInterface } from '../../../../services/interfaces/all-interfaces';
import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-order-details',
  imports: [TranslateModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {

  allOrders: ordersInterface[] = [];
  currentOrder: ordersInterface | undefined;
  customersDetails: customersDetailsInterface[] = [];
  currentCustomer: customersDetailsInterface | undefined;
  currentCustomerId: number | undefined;
  constructor(private allData: AllData, private translate: TranslateService) { }


  ngOnInit() {
    this.getOrderDetails();
    this.getCurrentOrder();
    this.getCustomersDetails();
    this.getCurrentCustomer();
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

  goBack() {
    window.history.back();
  }
}
