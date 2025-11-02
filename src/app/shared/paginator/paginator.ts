import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator implements OnInit, OnChanges {

  @Input() pageSize: number = 4;
  @Input() totalItems: number = 0;
  @Input() data: any[] = [];
  @Output() paginatedData: EventEmitter<any[]> = new EventEmitter<any[]>();

  totalPages: number[] = [];
  currentPage: number = 1;


  ngOnInit() {
    this.getPaginationData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // React to changes in data or totalItems
    if (changes['data'] || changes['totalItems']) {
      this.getPaginationData();
    }
  }

  // Get Pagination Data
  getPaginationData() {
    this.currentPage = 1; // Reset to first page
    this.calculateTotalPages();
    this.updatePaginationData();
  }

  // Calculate total pages based on data length
  private calculateTotalPages() {
    const totalPagesCount = Math.ceil(this.totalItems / this.pageSize);
    this.totalPages = Array.from({ length: totalPagesCount }, (_, i) => i + 1);
  }

  // Update pagination data based on current page
  private updatePaginationData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginated = this.data.slice(startIndex, endIndex);
    this.paginatedData.emit(paginated);
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
    const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${startItem}-${endItem} of ${this.totalItems}`;
  }
}
