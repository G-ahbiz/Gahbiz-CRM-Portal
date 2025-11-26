import { Component, OnInit } from '@angular/core';
import { LeadsTabel } from '../leads-tabel/leads-tabel';
import { TabsHeader } from '../../../../../shared/components/tabs-header/tabs-header';
import { AllData } from '../../../../../services/all-data';
import { LogCard } from '../../../../../shared/interfaces/log-card';

@Component({
  selector: 'app-leads-content',
  imports: [TabsHeader, LeadsTabel],
  templateUrl: './leads-content.html',
  styleUrl: './leads-content.css',
})
export class LeadsContent implements OnInit {
  cardsData: LogCard[] = [];

  constructor(private allData: AllData) {}

  ngOnInit() {
    this.getCardsData();
  }

  getCardsData() {
    this.cardsData = this.allData.getLeadsCardsData();
  }
}
