import { Component, Input, OnInit } from '@angular/core';
import { AllData } from '../../../../../services/all-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-agents-cards',
  imports: [CommonModule],
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
}
