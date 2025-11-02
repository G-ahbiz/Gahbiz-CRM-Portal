import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsHeader } from "../../../shared/tabs-header/tabs-header";
import { AllData } from '../../../services/all-data';
import { CardsInterface } from '../../../services/interfaces/all-interfaces';

@Component({
  selector: 'app-customers-crm',
  imports: [CommonModule, TabsHeader],
  templateUrl: './customers-crm.html',
  styleUrl: './customers-crm.css',
})
export class CustomersCrm implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getCustomersCardsData();
  }
}
