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
  totalOrders: number = 0;

  paginationData: ordersInterface[] = [];

  columnsHeader: string[] = [];

  // Pagination
  pageSize: number = 5;
  totalPages: number[] = [];
  currentPage: number = 1;

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getColumnsHeader();
    this.getPaginationData();
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

  // Get Pagination Data
  getPaginationData() {
    this.getOrdersData();
    this.currentPage = 1; // Reset to first page
    this.calculateTotalPages();
    this.updatePaginationData();
  }

  // Calculate total pages based on data length
  private calculateTotalPages() {
    const totalPagesCount = Math.ceil(this.totalOrders / this.pageSize);
    this.totalPages = Array.from({ length: totalPagesCount }, (_, i) => i + 1);
  }

  // Update pagination data based on current page
  private updatePaginationData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginationData = this.ordersData.slice(startIndex, endIndex);
  }

  // Navigate to next page
  nextPage() {
    if (!this.isLastPage()) {
      this.currentPage++;
      this.updatePaginationData();
    }
  }

  // Navigate to previous page
  previousPage() {
    if (!this.isFirstPage()) {
      this.currentPage--;
      this.updatePaginationData();
    }
  }

  // Navigate to specific page
  goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages.length) {
      this.currentPage = pageNumber;
      this.updatePaginationData();
    }
  }

  // Check if currently on first page
  isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  // Check if currently on last page
  isLastPage(): boolean {
    return this.currentPage === this.totalPages.length;
  }

  // Get current page info (e.g., "Showing 1-5 of 20")
  getPaginationInfo(): string {
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, this.totalOrders);
    return `Showing ${startItem}-${endItem} of ${this.totalOrders}`;
  }

  viewOrder(id: number) {
    console.log(id);
  }

}
