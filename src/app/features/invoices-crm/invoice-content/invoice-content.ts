import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InvoicesTabel } from '../invoices-tabel/invoices-tabel';
import { TabsHeader } from '../../../shared/components/tabs-header/tabs-header';
import { AllData } from '../../../services/all-data';
import { LogCard } from '../../../shared/interfaces/log-card';

@Component({
  selector: 'app-invoice-content',
  imports: [CommonModule, TabsHeader, InvoicesTabel],
  templateUrl: './invoice-content.html',
  styleUrl: './invoice-content.css',
})
export class InvoiceContent implements OnInit {
  cardsData: LogCard[] = [];

  constructor(private allData: AllData) {}

  ngOnInit() {
    this.getCardsData();
  }

  getCardsData() {
    this.cardsData = this.allData.getInvoicesCardsData();
  }
}
