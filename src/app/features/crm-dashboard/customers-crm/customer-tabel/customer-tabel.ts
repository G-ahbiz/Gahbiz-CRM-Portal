import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { AllData } from '../../../../services/all-data';
import { Customer } from '../../../../services/interfaces/all-interfaces';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

// Constants
const SESSION_STORAGE_KEYS = {
  CUSTOMER_ID: 'customerId'
} as const;

const DATE_FILTER_DAYS: Record<string, number> = {
  'all': 0,
  'last-7-days': 7,
  'last-30-days': 30,
  'last-60-days': 60,
  'last-90-days': 90,
  'last-180-days': 180,
  'last-365-days': 365
} as const;


type FilterValue = keyof typeof DATE_FILTER_DAYS;

@Component({
  selector: 'app-customer-tabel',
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    PaginatorModule],
  templateUrl: './customer-tabel.html',
  styleUrl: './customer-tabel.css',
})
export class CustomerTabel implements OnInit, OnDestroy {

  // Pagination state
  first: number = 0;
  rows: number = 4;

  /**
   * Get paginated data slice based on current page state
   */
  get paginatedCustomers(): Customer[] {
    const start = this.first;
    const end = this.first + this.rows;
    return this.paginationData.slice(start, end);
  }

  /**
   * Handle page change events from PrimeNG paginator
   */
  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.updateSelectAllState();
  }

  // Table configuration
  readonly customersTabelHeader: readonly string[] = [
    'Customer ID',
    'Phone Number',
    'Customer Name',
    'No of Orders',
    'Status',
    'Assigned To',
    'Actions'
  ];

  // Data properties
  private allCustomersData: Customer[] = [];
  customersTabelData: Customer[] = [];
  paginationData: Customer[] = [];
  totalCustomersTabelData: number = 0;

  // Selection state
  isAllSelected: boolean = false;

  // Filter state
  search: string = '';
  filterValue: FilterValue = 'all';

  constructor(
    private readonly router: Router,
    private readonly allData: AllData
  ) { }

  ngOnInit(): void {
    this.loadCustomersData();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Load initial customers data from service
   */
  private loadCustomersData(): void {
    this.allCustomersData = this.allData.getCustomersTabelData().map((customer: Customer) => ({
      ...customer,
      selected: false
    }));
    this.customersTabelData = [...this.allCustomersData];
    this.applyFilters();
  }

  /**
   * Get count of selected customers
   */
  get selectedCustomersCount(): number {
    return this.paginationData.filter(customer => customer.selected).length;
  }

  /**
   * Handle select all checkbox toggle
   * Only affects customers on the current page
   */
  onSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    // Update selection state for all visible customers on current page
    this.paginatedCustomers.forEach(customer => {
      customer.selected = this.isAllSelected;
    });
  }

  /**
   * Toggle individual customer selection
   */
  toggleCustomerSelection(customer: Customer): void {
    customer.selected = !customer.selected;

    // Update "select all" state based on individual selections
    this.updateSelectAllState();
  }

  /**
   * Update the select all checkbox state based on individual selections
   * Only checks invoices on the current page
   */
  private updateSelectAllState(): void {
    const currentPageCustomers = this.paginatedCustomers;
    if (currentPageCustomers.length === 0) {
      this.isAllSelected = false;
      return;
    }

    const allSelected = currentPageCustomers.every(customer => customer.selected);
    const noneSelected = currentPageCustomers.every(customer => !customer.selected);

    this.isAllSelected = allSelected && !noneSelected;
  }

  /**
   * Navigate to customer details page
   */
  viewCustomer(id: number): void {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.CUSTOMER_ID, id.toString());
    this.router.navigate(['/main/customers/customer-details']);
  }

  /**
   * Handle search input changes and filter customers data
   */
  onSearchChange(value: string): void {
    this.search = value.toLowerCase().trim();
    this.applyFilters();
  }

  /**
   * Apply search filter to customers
   */
  private applySearchFilter(customers: Customer[]): Customer[] {
    if (!this.search) {
      return customers;
    }

    return customers.filter(customer => this.matchesSearchTerm(customer, this.search));
  }

  /**
   * Check if an customer matches the search term
   */
  private matchesSearchTerm(customer: Customer, searchTerm: string): boolean {
    const searchableFields = [
      customer.id?.toString(),
      customer.customer,
      customer.phoneNumber,
      customer.customerName,
      customer.noOfOrders,
      customer.status,
      customer.assignedTo
    ];

    return searchableFields.some(field =>
      (field as string)?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Apply all active filters and update pagination data
   */
  private applyFilters(): void {
    // Start with all customers data
    let filteredData = [...this.customersTabelData];

    // Apply search filter
    filteredData = this.applySearchFilter(filteredData);

    // Update pagination data and total count
    this.paginationData = filteredData;
    this.totalCustomersTabelData = filteredData.length;

    // Reset to first page when filters change
    this.first = 0;

    // Update select all state for new filtered data
    this.updateSelectAllState();
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByCustomerId(index: number, customer: Customer): number {
    return customer.id;
  }
}
