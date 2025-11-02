import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AllData } from '../../../services/all-data';
import { TabsHeader } from "../../../shared/tabs-header/tabs-header";
import { CardsInterface } from '../../../services/interfaces/all-interfaces';


@Component({
  selector: 'app-orders-crm',
  imports: [CommonModule, TabsHeader],
  templateUrl: './orders-crm.html',
  styleUrl: './orders-crm.css',
})
export class OrdersCrm implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getOrdersCardsData();
  }
}
