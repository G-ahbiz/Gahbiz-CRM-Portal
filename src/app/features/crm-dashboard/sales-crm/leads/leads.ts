import { Component, OnInit } from '@angular/core';
import { TabsHeader } from "../../../../shared/tabs-header/tabs-header";
import { AllData } from '../../../../services/all-data';
import { CardsInterface } from '../../../../services/interfaces/all-interfaces';

@Component({
  selector: 'app-leads',
  imports: [TabsHeader],
  templateUrl: './leads.html',
  styleUrl: './leads.css',
})
export class Leads implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getLeadsCardsData();
  }
}
