import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AllData } from '../../../../../services/all-data';
import { CardsInterface, SalesAgents } from '../../../../../services/interfaces/all-interfaces';
import { TabsHeader } from "../../../../../shared/tabs-header/tabs-header";
import { SalesAgentsTabel } from "../sales-agents-tabel/sales-agents-tabel";

@Component({
  selector: 'app-sales-agents-details',
  imports: [CommonModule, TranslateModule, TabsHeader, SalesAgentsTabel],
  templateUrl: './sales-agents-details.html',
  styleUrl: './sales-agents-details.css',
})
export class SalesAgentsDetails implements OnInit {

  salesAgentsDetailsData: any = {};
  salesAgentsDetailsDataCards: CardsInterface[] = [];
  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getSalesAgentsDetailsDataCards();
    this.getSalesAgentsDetailsData();
  }

  getSalesAgentsDetailsDataCards() {
    this.salesAgentsDetailsDataCards = this.allData.getSalesAgentsDetailsDataCards();
  }

  getSalesAgentsDetailsData() {
    let salesAgentId = sessionStorage.getItem('salesAgentId');
    if (salesAgentId) {
      this.salesAgentsDetailsData = this.allData.getSalesAgentsDetailsData().find(salesAgent => salesAgent.id === parseInt(salesAgentId)) || {};
      console.log(this.salesAgentsDetailsData);
    }
  }

  goBack() {
    window.history.back();
  }
}
