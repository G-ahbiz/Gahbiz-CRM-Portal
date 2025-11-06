import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AllData } from '../../../../services/all-data';
import { ordersInterface } from '../../../../services/interfaces/all-interfaces';
import { Paginator } from "../../../../shared/paginator/paginator";
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders-tabel',
  imports: [CommonModule, Paginator, TranslateModule, RouterLink],
  templateUrl: './orders-tabel.html',
  styleUrl: './orders-tabel.css',
})
export class OrdersTabel implements OnInit {

  ordersData: ordersInterface[] = [];
  filteredOrders: ordersInterface[] = [];
  totalOrders: number = 0;
  selectedOrdersCount: number = 0;
  columnsHeader: string[] = [];
  paginationData: ordersInterface[] = [];

  // Search & Filter
  search: string = '';
  filterValue: string = 'all';

  constructor(private allData: AllData, private router: Router)  { }

  ngOnInit() {
    this.getColumnsHeader();
    this.getOrdersData();
    // Apply initial filter after data is loaded
    this.applyFilters();
  }

  onSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.filteredOrders.forEach(order => {
      const orderCheckbox = document.getElementById(`order-${order.id}`) as HTMLInputElement;
      if (orderCheckbox) {
        orderCheckbox.checked = checkbox.checked;
        if (checkbox.checked) {
          this.selectedOrdersCount++;
        } else {
          this.selectedOrdersCount--;
        }
      }
    });
  }

  getOrdersData() {
    this.ordersData = this.allData.getOrdersTabelData();
    this.filteredOrders = [...this.ordersData];
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

  // Orders Details
  viewOrder(id: number) {
    let orderId = sessionStorage.getItem('orderId');
    if (orderId) {
      sessionStorage.setItem('orderId', id.toString());
      this.router.navigate(['/main/orders/order-details']);
    } else {
      sessionStorage.setItem('orderId', id.toString());
      this.router.navigate(['/main/orders/order-details']);
    }
  }

  checkOrderBox(id: number) {
    const orderBox = document.getElementById(`order-${id}`) as HTMLInputElement;
    if (orderBox) {
      orderBox.checked = !orderBox.checked;
    }
  }

  /**
   * Handle pagination changes from the paginator component
   * @param paginatedData - The sliced data for the current page
   */
  onPaginationChange(paginatedData: ordersInterface[]) {
    this.paginationData = paginatedData;
  }


  /**
   * Handle search input changes and filter orders data
   * @param value - The search query string
   */
  onSearchChange(value: string) {
    console.log(value);
    this.search = value.toLowerCase().trim();
    this.applyFilters();
  }

  /**
   * Handle filter dropdown changes and apply date range filtering
   * @param value - The selected filter option value
   */
  onFilterChange(value: string) {
    this.filterValue = value;
    this.applyFilters();
  }

  /**
   * Apply both search and filter to the orders data
   * Searches across order ID, customer name, status, location, payment method, and total amount
   * Filters by date range based on the selected filter value
   */
  private applyFilters() {
    let filtered = [...this.ordersData];

    // Apply date filter
    if (this.filterValue !== 'all') {
      const days = this.getDaysFromFilter(this.filterValue);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= cutoffDate;
      });
    }

    // Apply search filter
    if (this.search) {
      filtered = filtered.filter(order => {
        const searchTerm = this.search;
        return (
          (order.orderId?.toString().toLowerCase() || '').includes(searchTerm) ||
          (order.customer?.toLowerCase() || '').includes(searchTerm) ||
          (order.status?.toLowerCase() || '').includes(searchTerm) ||
          (order.locations?.toLowerCase() || '').includes(searchTerm) ||
          (order.paymentMethod?.toLowerCase() || '').includes(searchTerm) ||
          (order.total?.toString() || '').includes(searchTerm)
        );
      });
    }

    this.filteredOrders = filtered;
    this.totalOrders = filtered.length;
    // this.getOrdersData();
  }

  /**
   * Convert filter value to number of days
   * @param filterValue - The filter option value
   * @returns Number of days for the date range
   */
  private getDaysFromFilter(filterValue: string): number {
    const daysMap: { [key: string]: number } = {
      'all': 0,
      'last-7-days': 7,
      'last-30-days': 30,
      'last-60-days': 60,
      'last-90-days': 90,
      'last-180-days': 180,
      'last-365-days': 365
    };
    return daysMap[filterValue] || 7; // Default to 7 days
  }

}
