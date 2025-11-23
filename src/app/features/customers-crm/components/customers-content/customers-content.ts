import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsHeader } from '../../../../shared/components/tabs-header/tabs-header';
import { AllData } from '../../../../services/all-data';
import { CustomerTabel } from '../customer-tabel/customer-tabel';
import { LogCard } from '../../../../shared/interfaces/log-card';

@Component({
  selector: 'app-customers-content',
  imports: [TabsHeader, CommonModule, CustomerTabel],
  templateUrl: './customers-content.html',
  styleUrl: './customers-content.css',
})
export class CustomersContent implements OnInit {
  cardsData: LogCard[] = [];

  constructor(private allData: AllData) {}

  ngOnInit() {
    this.getCardsData();
  }

  getCardsData() {
    this.cardsData = this.allData.getCustomersCardsData();
  }
}
