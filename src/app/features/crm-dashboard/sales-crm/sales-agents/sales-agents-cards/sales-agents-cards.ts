import { Component, Input, OnInit } from '@angular/core';
import { AllData } from '../../../../../services/all-data';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sales-agents-cards',
  imports: [CommonModule, TranslateModule],
  templateUrl: './sales-agents-cards.html',
  styleUrl: './sales-agents-cards.css',
})
export class SalesAgentsCards implements OnInit {

  @Input() dataCards: any[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getDataCards()
  }

  getDataCards() {
    this.dataCards = this.allData.getSalesAgentsDataCards();
  }

  onSearchChange(value: string) {
    console.log(value);
  }
}
