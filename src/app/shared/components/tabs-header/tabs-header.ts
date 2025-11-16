import { Component, Input, OnInit } from '@angular/core';
import { AllServices } from '../../../services/all-services';
import { CommonModule } from '@angular/common';
import { LogCard } from '../../interfaces/log-card';

@Component({
  selector: 'app-tabs-header',
  imports: [CommonModule],
  templateUrl: './tabs-header.html',
  styleUrl: './tabs-header.css',
})
export class TabsHeader implements OnInit {
  @Input() title: string = '';
  @Input() cardsData: LogCard[] = [];
  @Input() folderName: string = '';

  constructor(private allServices: AllServices) {}

  ngOnInit() {}
}
