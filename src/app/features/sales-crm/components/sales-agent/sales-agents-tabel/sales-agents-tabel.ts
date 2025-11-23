import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { AllData } from '../../../../../services/all-data';
import { LeadsInterface } from '../../../../../services/interfaces/all-interfaces';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

// const SESSION_STORAGE_KEYS = {
//   LEAD_ID: 'salesAgentId'
// } as const;

export const salesAgentHeader: readonly string[] = [
  'ID',
  'Name',
  'Service',
  'Status',
  'Source',
  'Assigned To',
  'Value',
  'Created Date'
];
@Component({
  selector: 'app-sales-agents-tabel',
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, RouterLink, TranslateModule],
  templateUrl: './sales-agents-tabel.html',
  styleUrl: './sales-agents-tabel.css',
  providers: [AllData]
})
export class SalesAgentsTabel implements OnInit {
  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  salesAgentData: LeadsInterface[] = [];
  leadsTabelHeader: readonly string[] = salesAgentHeader;

  activityValues: number[] = [0, 100];

  searchValue: string = '';
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Selection state
  isAllSelected: boolean = false;

  constructor(private allData: AllData, private router: Router) { }

  ngOnInit() {
    this.getSalesAgentData()
  }

  getSalesAgentData() {
    this.salesAgentData = this.allData.getSalesAgentTabel();
    this.loading = false;
  }

  clear(table: Table) {
    this.searchValue = '';
    this.searchInput.nativeElement.value = '';
    table.clear();
  }

  onSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    // Update selection state for all visible leads on current page
    this.salesAgentData.forEach(salesAgent => {
      salesAgent.selected = this.isAllSelected;
    });
  }

  toggleSalesAgentSelection(lead: LeadsInterface) {
    lead.selected = !lead.selected;
    this.updateSelectAllState();
  }

  private updateSelectAllState() {
    const currentPageSalesAgent = this.salesAgentData;
    if (currentPageSalesAgent.length === 0) {
      this.isAllSelected = false;
      return;
    }

    this.isAllSelected = currentPageSalesAgent.every(salesAgent => salesAgent.selected);
  }


  viewSalesAgent(id: number) {
    sessionStorage.setItem('salesAgentId', id.toString());
    this.router.navigate(['/main/sales/leads/leads-details']);
  }

  editSalesAgent(id: number) {
    sessionStorage.setItem('salesAgentId', id.toString());
    this.router.navigate(['/main/sales/leads/add-lead']);
  }

  deleteSalesAgent(id: number) {
    sessionStorage.setItem('salesAgentId', id.toString());
    this.router.navigate(['/main/sales/leads/add-lead']);
  }


}
