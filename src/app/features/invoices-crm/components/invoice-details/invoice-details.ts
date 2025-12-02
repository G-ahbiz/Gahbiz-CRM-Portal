import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { customersDetailsInterface, Invoice } from 'app/services/interfaces/all-interfaces';
import { AllData } from 'app/services/all-data';

@Component({
  selector: 'app-invoice-details',
  imports: [DatePipe, TranslateModule],
  templateUrl: './invoice-details.html',
  styleUrl: './invoice-details.css',
})
export class InvoiceDetails implements OnInit {
  allInvoices: Invoice[] = [];
  currentInvoice: Invoice | undefined;
  statusSelect: HTMLSelectElement | null = null;
  allCustomers: customersDetailsInterface[] = [];
  currentCustomer: customersDetailsInterface | undefined;
  servicesHistory: any[] = [];
  servicesTotalQuantity: number = 0;
  servicesTotalPrice: number = 0;

  constructor(private allData: AllData) {}

  ngOnInit(): void {
    this.getInvoiceDetails();
    this.getCustomersData();
    this.getServicesHistory();
  }

  getInvoiceDetails() {
    this.allInvoices = this.allData.getInvoicesTabelData();
    let invoiceId = sessionStorage.getItem('invoiceId');
    if (invoiceId) {
      this.currentInvoice = this.allInvoices.find((invoice) => invoice.id === parseInt(invoiceId));
      this.setStatusSelect();
    } else {
      this.currentInvoice = undefined;
    }
  }

  setStatusSelect() {
    this.statusSelect = document.querySelector('#statusSelect') as HTMLSelectElement;
    this.statusSelect.value = this.currentInvoice?.status || '';
  }

  // Customers Data
  getCustomersData() {
    this.allCustomers = this.allData.getCustomersDetailsData();
    this.getCurrentCustomer();
  }

  getCurrentCustomer() {
    let customerId = this.currentInvoice?.clientId;
    if (customerId) {
      this.currentCustomer = this.allCustomers.find((customer) => customer.id === customerId);
    } else {
      this.currentCustomer = undefined;
    }
  }

  getServicesHistory() {
    this.servicesHistory = this.allData.getServicesHistoryData();
    this.servicesTotalQuantity = this.servicesHistory.reduce(
      (total, service) => total + service.quantity,
      0
    );
    this.servicesTotalPrice = this.servicesHistory.reduce(
      (total, service) => total + service.total,
      0
    );
  }

  onStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    console.log(target.value);
  }

  goBack() {
    window.history.back();
  }
}
