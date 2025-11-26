import { Component, OnInit } from '@angular/core';
import { SalesAgentsCards } from '../sales-agents-cards/sales-agents-cards';
import { TabsHeader } from '../../../../../shared/components/tabs-header/tabs-header';
import { AllData } from '../../../../../services/all-data';
import { LogCard } from '../../../../../shared/interfaces/log-card';

@Component({
  selector: 'app-sales-agent-content',
  imports: [SalesAgentsCards, TabsHeader],
  templateUrl: './sales-agent-content.html',
  styleUrl: './sales-agent-content.css',
})
export class SalesAgentContent implements OnInit {
  cardsData: LogCard[] = [];

  constructor(private allData: AllData) {}

  ngOnInit() {
    this.getCardsData();
  }

  getCardsData() {
    this.cardsData = this.allData.getSalesAgentCardsData();
  }
}
