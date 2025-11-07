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


const SESSION_STORAGE_KEYS = {
  LEAD_ID: 'leadId'
} as const;

export const leadsTabelHeader: readonly string[] = [
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
  selector: 'app-leads-tabel',
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, RouterLink],
  templateUrl: './leads-tabel.html',
  styleUrl: './leads-tabel.css',
  providers: [AllData]
})
export class LeadsTabel implements OnInit {
  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  leadsData: LeadsInterface[] = [];
  leadsTabelHeader: readonly string[] = leadsTabelHeader;

  activityValues: number[] = [0, 100];

  searchValue: string = '';
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private allData: AllData, private router: Router) { }

  ngOnInit() {
    this.getLeadsData()
  }

  getLeadsData() {
    this.leadsData = this.allData.getLeadsTabelData();
    this.loading = false;
  }

  clear(table: Table) {
    this.searchValue = '';
    this.searchInput.nativeElement.value = '';
    table.clear();
  }


  viewLead(id: number) {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.LEAD_ID, id.toString());
    this.router.navigate(['/main/sales/leads/leads-details']);
  }

  editLead(id: number) {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.LEAD_ID, id.toString());
    this.router.navigate(['/main/sales/leads/add-lead']);
  }

  deleteLead(id: number) {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.LEAD_ID, id.toString());
    this.router.navigate(['/main/sales/leads/add-lead']);
  }


}
