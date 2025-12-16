import { Component } from '@angular/core';
import { TabsHeader } from '@shared/components/tabs-header/tabs-header';
import { LogCard } from '@shared/interfaces/log-card';
import { AllData } from 'app/services/all-data';
import { OperationsTable } from '../../components/operations-table/operations-table';

@Component({
  selector: 'app-operations-content',
  imports: [TabsHeader, OperationsTable],
  templateUrl: './operations-content.html',
  styleUrl: './operations-content.css',
})
export class OperationsContent {
  cardsData: LogCard[] = [];

  constructor(private allData: AllData) {}

  ngOnInit() {
    this.getCardsData();
  }

  getCardsData() {
    this.cardsData = this.allData.getOperationsCardsData();
  }

  
}
