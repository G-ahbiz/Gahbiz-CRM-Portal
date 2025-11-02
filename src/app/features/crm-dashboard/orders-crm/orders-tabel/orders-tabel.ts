import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AllData } from '../../../../services/all-data';
import { ordersInterface } from '../../../../services/interfaces/all-interfaces';

@Component({
  selector: 'app-orders-tabel',
  imports: [CommonModule],
  templateUrl: './orders-tabel.html',
  styleUrl: './orders-tabel.css',
})
export class OrdersTabel implements OnInit {

  ordersData: ordersInterface[] = [];

  columnsHeader: string[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getOrdersData();
    this.getColumnsHeader();
  }

  getOrdersData() {
    this.ordersData = this.allData.getOrdersTabelData();
  }

  getColumnsHeader() {
    this.columnsHeader = [
      'Order ID',
      'Date',
      'Customer',
      'Total',
      'Status',
      'Locations',
      'Payment Method',
      'Actions',
    ];
  }

}
