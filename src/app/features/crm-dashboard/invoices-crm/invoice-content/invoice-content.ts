import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsHeader } from "../../../../shared/tabs-header/tabs-header";
import { CardsInterface } from '../../../../services/interfaces/all-interfaces';
import { AllData } from '../../../../services/all-data';
import { InvoicesTabel } from "../invoices-tabel/invoices-tabel";

@Component({
  selector: 'app-invoice-content',
  imports: [CommonModule, TabsHeader, InvoicesTabel,],
  templateUrl: './invoice-content.html',
  styleUrl: './invoice-content.css',
})
export class InvoiceContent implements OnInit {

  cardsData: CardsInterface[] = [];

  constructor(private allData: AllData) { }

  ngOnInit() {
    this.getCardsData()
  }

  getCardsData() {
    this.cardsData = this.allData.getInvoicesCardsData();
  }
}
