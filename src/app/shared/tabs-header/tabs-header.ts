import { Component, Input, OnInit } from '@angular/core';
import { AllServices } from '../../services/all-services';
import { CommonModule } from '@angular/common';
import { CardsInterface } from '../../services/interfaces/all-interfaces';

@Component({
  selector: 'app-tabs-header',
  imports: [CommonModule],
  templateUrl: './tabs-header.html',
  styleUrl: './tabs-header.css',
})
export class TabsHeader implements OnInit {

  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() cardsData: CardsInterface[] = [];
  @Input() folderName: string = '';

  constructor(private allServices: AllServices) { }

  ngOnInit() { }


}

