import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-leads',
  imports: [RouterOutlet],
  templateUrl: './leads.html',
  styleUrl: './leads.css',
})
export class Leads implements OnInit {

  ngOnInit() { }

}
