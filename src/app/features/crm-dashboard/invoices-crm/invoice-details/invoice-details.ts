import { Component, OnInit } from '@angular/core';
import { AllData } from '../../../../services/all-data';
import { customersDetailsInterface, Invoice } from '../../../../services/interfaces/all-interfaces';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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

  constructor(private allData: AllData) { }

  ngOnInit(): void {
    this.getInvoiceDetails();
    this.getCustomersData();
  }

  getInvoiceDetails() {
    this.allInvoices = this.allData.getInvoicesTabelData();
    let invoiceId = sessionStorage.getItem('invoiceId');
    if (invoiceId) {
      this.currentInvoice = this.allInvoices.find(invoice => invoice.id === parseInt(invoiceId));
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
      this.currentCustomer = this.allCustomers.find(customer => customer.id === customerId);
    } else {
      this.currentCustomer = undefined;
    }
  }

  onStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    console.log(target.value);
  }

  goBack() {
    window.history.back();
  }
}
