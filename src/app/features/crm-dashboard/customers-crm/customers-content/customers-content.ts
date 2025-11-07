import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AllData } from '../../../../services/all-data';
import { CardsInterface } from '../../../../services/interfaces/all-interfaces';
import { TabsHeader } from '../../../../shared/tabs-header/tabs-header';
import { CustomerTabel } from "../customer-tabel/customer-tabel";


@Component({
  selector: 'app-customers-content',
  imports: [TabsHeader, CommonModule, CustomerTabel],
  templateUrl: './customers-content.html',
  styleUrl: './customers-content.css',
})
export class CustomersContent implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getCustomersCardsData();
  }
}
