import { Component, OnInit } from '@angular/core';
import { CardsInterface } from '../../../../services/interfaces/all-interfaces';
import { AllData } from '../../../../services/all-data';
import { CommonModule } from '@angular/common';
import { TabsHeader } from '../../../../shared/tabs-header/tabs-header';
import { OrdersTabel } from '../orders-tabel/orders-tabel';

@Component({
  selector: 'app-orders-content',
  imports: [CommonModule, TabsHeader, OrdersTabel],
  templateUrl: './orders-content.html',
  styleUrl: './orders-content.css',
})
export class OrdersContent implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getOrdersCardsData();
  }
}
