import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-invoices-crm',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './invoices-crm.html',
  styleUrl: './invoices-crm.css',
})
export class InvoicesCrm {

}
