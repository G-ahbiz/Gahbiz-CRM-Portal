import { Component, OnInit } from '@angular/core';
import { SalesAgentsCards } from "../sales-agents-cards/sales-agents-cards";
import { TabsHeader } from "../../../../../shared/tabs-header/tabs-header";
import { CardsInterface } from '../../../../../services/interfaces/all-interfaces';
import { AllData } from '../../../../../services/all-data';

@Component({
  selector: 'app-sales-agent-content',
  imports: [SalesAgentsCards, TabsHeader],
  templateUrl: './sales-agent-content.html',
  styleUrl: './sales-agent-content.css',
})
export class SalesAgentContent implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getSalesAgentCardsData();
  }


}
