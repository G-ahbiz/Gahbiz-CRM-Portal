import { Component, OnInit } from '@angular/core';
import { AllData } from '../../../../../services/all-data';
import { CardsInterface } from '../../../../../services/interfaces/all-interfaces';
import { TabsHeader } from '../../../../../shared/tabs-header/tabs-header';
import { LeadsTabel } from '../leads-tabel/leads-tabel';

@Component({
  selector: 'app-leads-content',
  imports: [TabsHeader, LeadsTabel],
  templateUrl: './leads-content.html',
  styleUrl: './leads-content.css',
})
export class LeadsContent implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getLeadsCardsData();
  }
}
