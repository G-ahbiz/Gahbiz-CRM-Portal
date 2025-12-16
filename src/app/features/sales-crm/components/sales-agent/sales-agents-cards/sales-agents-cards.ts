import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule } from 'primeng/popover';
import { Router } from '@angular/router';
import { AllData } from '../../../../../services/all-data';

@Component({
  selector: 'app-sales-agents-cards',
  imports: [CommonModule, TranslateModule, PopoverModule],
  templateUrl: './sales-agents-cards.html',
  styleUrl: './sales-agents-cards.css',
})
export class SalesAgentsCards implements OnInit {
  @Input() dataCards: any[] = [];
  searchValue: string = '';
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  constructor(private allData: AllData, private router: Router) {}

  ngOnInit() {
    this.getDataCards();
  }

  getDataCards() {
    this.dataCards = this.allData.getSalesAgentsDataCards();
  }

  onSearchChange(value: string) {
    this.searchValue = value.trim().toLowerCase();
    if (this.searchValue === '') {
      this.getDataCards();
      return;
    } else {
      let filteredCards = this.dataCards.filter((card) =>
        card.name?.toLowerCase().includes(this.searchValue)
      );
      this.dataCards = filteredCards;
    }
  }

  clearSearch() {
    this.searchValue = '';
    this.searchInput.nativeElement.value = '';
    this.getDataCards();
  }

  viewSalesAgent(id: string): void {
    this.router.navigate(['/main/sales/sales-agents/sales-agent-details', id]);
  }
}
