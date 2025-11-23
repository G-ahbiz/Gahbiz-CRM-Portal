import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from "@angular/router";


@Component({
  selector: 'app-orders-crm',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './orders-crm.html',
  styleUrl: './orders-crm.css',
})
export class OrdersCrm implements OnInit {
  constructor() { }
  ngOnInit() { }

}
