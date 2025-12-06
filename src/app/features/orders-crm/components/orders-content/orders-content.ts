import { Component, OnInit } from '@angular/core';

import { OrdersTabel } from '../orders-tabel/orders-tabel';
import { CommonModule } from '@angular/common';
import { AllData } from '../../../../services/all-data';
import { TabsHeader } from '../../../../shared/components/tabs-header/tabs-header';
import { LogCard } from '../../../../shared/interfaces/log-card';

@Component({
  selector: 'app-orders-content',
  imports: [CommonModule, TabsHeader, OrdersTabel],
  templateUrl: './orders-content.html',
  styleUrl: './orders-content.css',
})
export class OrdersContent implements OnInit {
  cardsData: LogCard[] = [];

  constructor(private allData: AllData) {}

  ngOnInit() {
    this.getCardsData();
  }

  getCardsData() {
    this.cardsData = this.allData.getOrdersCardsData();
  }
}
