import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TabsHeader } from "../../../shared/tabs-header/tabs-header";
import { CardsInterface } from '../../../services/interfaces/all-interfaces';
import { AllData } from '../../../services/all-data';

@Component({
  selector: 'app-invoices-crm',
  imports: [CommonModule, TabsHeader],
  templateUrl: './invoices-crm.html',
  styleUrl: './invoices-crm.css',
})
export class InvoicesCrm {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getInvoicesCardsData();
  }
}
