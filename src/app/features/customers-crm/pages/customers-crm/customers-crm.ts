import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-customers-crm',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './customers-crm.html',
  styleUrl: './customers-crm.css',
})
export class CustomersCrm implements OnInit {

  ngOnInit() { }
}
