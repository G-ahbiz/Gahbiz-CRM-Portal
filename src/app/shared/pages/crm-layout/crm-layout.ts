import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-crm-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.css',
})
export class CrmLayout {}
