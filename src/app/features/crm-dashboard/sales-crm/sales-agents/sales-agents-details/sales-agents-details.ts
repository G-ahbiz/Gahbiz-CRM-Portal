import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AllData } from '../../../../../services/all-data';
import { CardsInterface, SalesAgents } from '../../../../../services/interfaces/all-interfaces';
import { TabsHeader } from "../../../../../shared/tabs-header/tabs-header";
import { SalesAgentsTabel } from "../sales-agents-tabel/sales-agents-tabel";
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-sales-agents-details',
  imports: [CommonModule, TranslateModule, TabsHeader, SalesAgentsTabel, CanvasJSAngularChartsModule],
  templateUrl: './sales-agents-details.html',
  styleUrl: './sales-agents-details.css',
})
export class SalesAgentsDetails implements OnInit {

  salesAgentsDetailsData: any = {};
  salesAgentsDetailsDataCards: CardsInterface[] = [];
  constructor(private allData: AllData) { }
  title = 'angular17ssrapp';
  chartOptionsVertical = {
    title: {
      text: "Angular Column Chart with Index Labels"
    },
    animationEnabled: true,
    axisY: {
      includeZero: true
    },
    data: [{
      type: "column", //change type to bar, line, area, pie, etc
      //indexLabel: "{y}", //Shows y value on all Data Points
      indexLabelFontColor: "#5A5757",
      dataPoints: [
        { x: 10, y: 71 },
        { x: 20, y: 55 },
        { x: 30, y: 50 },
        { x: 40, y: 65 },
        { x: 50, y: 71 },
        { x: 60, y: 92, indexLabel: "Highest\u2191" },
        { x: 70, y: 68 },
        { x: 80, y: 38, indexLabel: "Lowest\u2193" },
        { x: 90, y: 54 },
        { x: 100, y: 60 }
      ]
    }]
  }

  chartOptionsHorizontal = {
    animationEnabled: true,
    title: {
      text: "Project Cost Breakdown"
    },
    data: [{
      type: "doughnut",
      yValueFormatString: "#,###.##'%'",
      indexLabel: "{name}",
      dataPoints: [
        { y: 75, name: "Success" },
        { y: 15, name: "On Hold" },
      ]
    }]
  }

  ngOnInit() {
    this.getSalesAgentsDetailsDataCards();
    this.getSalesAgentsDetailsData();
  }

  getSalesAgentsDetailsDataCards() {
    this.salesAgentsDetailsDataCards = this.allData.getSalesAgentsDetailsDataCards();
  }

  getSalesAgentsDetailsData() {
    let salesAgentId = sessionStorage.getItem('salesAgentId');
    if (salesAgentId) {
      this.salesAgentsDetailsData = this.allData.getSalesAgentsDetailsData().find(salesAgent => salesAgent.id === parseInt(salesAgentId)) || {};
      console.log(this.salesAgentsDetailsData);
    }
  }

  goBack() {
    window.history.back();
  }
}
