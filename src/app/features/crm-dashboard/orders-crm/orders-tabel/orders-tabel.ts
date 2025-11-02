import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AllData } from '../../../../services/all-data';
import { ordersInterface } from '../../../../services/interfaces/all-interfaces';
import { Paginator } from "../../../../shared/paginator/paginator";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-tabel',
  imports: [CommonModule, Paginator, TranslateModule],
  templateUrl: './orders-tabel.html',
  styleUrl: './orders-tabel.css',
})
export class OrdersTabel implements OnInit {

  ordersData: ordersInterface[] = [];
  totalOrders: number = 0;

  columnsHeader: string[] = [];

  // Pagination
  paginationData: ordersInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getColumnsHeader();
    this.getOrdersData();
  }

  getOrdersData() {
    this.ordersData = this.allData.getOrdersTabelData();
    this.totalOrders = this.ordersData.length;
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

  /**
   * Handle pagination changes from the paginator component
   * @param paginatedData - The sliced data for the current page
   */
  onPaginationChange(paginatedData: ordersInterface[]) {
    this.paginationData = paginatedData;
  }

  viewOrder(id: number) {
    console.log(id);
  }

}
