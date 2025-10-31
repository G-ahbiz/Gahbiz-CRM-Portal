import { Component } from '@angular/core';
import { Sidebar } from "./sidebar/sidebar";
import { Header } from "./header/header";
import { RouterOutlet } from "@angular/router";
import { Tabel } from "../../shared/tabel/tabel";

@Component({
  selector: 'app-crm-layout',
  imports: [Sidebar, Header, RouterOutlet, Tabel],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.css',
})
export class CrmLayout {

}
