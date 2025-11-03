import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-order',
  imports: [TranslateModule],
  templateUrl: './add-order.html',
  styleUrl: './add-order.css',
})
export class AddOrder {

  goBack() {
    window.history.back();
  }
}
