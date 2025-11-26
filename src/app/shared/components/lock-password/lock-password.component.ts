import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lock-password',
  imports: [CommonModule],
  templateUrl: './lock-password.component.html',
  styleUrls: ['./lock-password.component.scss']
})
export class LockPasswordComponent {
  @Input() showPassword = false;
  @Output() showPasswordChange = new EventEmitter<boolean>();

  constructor () {}

  toggle(): void {
    this.showPassword = !this.showPassword;
    this.showPasswordChange.emit(this.showPassword);
  }
}
