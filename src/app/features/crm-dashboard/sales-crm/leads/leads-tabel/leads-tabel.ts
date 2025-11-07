import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { AllData } from '../../../../../services/all-data';
import { LeadsInterface } from '../../../../../services/interfaces/all-interfaces';
import { Table } from 'primeng/table';
import { ProgressBar } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';


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
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule],
  templateUrl: './leads-tabel.html',
  styleUrl: './leads-tabel.css',
  providers: [AllData]
})
export class LeadsTabel implements OnInit {
  @ViewChild('dt') dt!: Table;
  loading: boolean = false;
  leadsData: LeadsInterface[] = [];
  leadsTabelHeader: readonly string[] = leadsTabelHeader;


  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getLeadsData()
  }

  getLeadsData() {
    this.loading = true;
    this.leadsData = this.allData.getLeadsTabelData();
    this.loading = false;
  }

  viewLead(id: number) {
    console.log(id);
  }

  editLead(id: number) {
    console.log(id);
  }

  deleteLead(id: number) {
    console.log(id);
  }

  // customSort(event: SortEvent) {
  //   if (this.isSorted == null || this.isSorted === undefined) {
  //     this.isSorted = true;
  //     this.sortTableData(event);
  //   } else if (this.isSorted == true) {
  //     this.isSorted = false;
  //     this.sortTableData(event);
  //   } else if (this.isSorted == false) {
  //     this.isSorted = null;
  //     this.leadsData = [...this.initialValue];
  //     this.dt.reset();
  //   }
  // }

  // sortTableData(event: SortEvent) {
  //   event.data?.sort((data1, data2) => {
  //     let value1 = data1[event.field as keyof LeadsInterface];
  //     let value2 = data2[event.field as keyof LeadsInterface];
  //     let result = null;
  //     if (value1 == null && value2 != null) result = -1;
  //     else if (value1 != null && value2 == null) result = 1;
  //     else if (value1 == null && value2 == null) result = 0;
  //     else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
  //     else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

  //     return event.order! * result;
  //   });
  // }
}
