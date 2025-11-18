import { Component, EventEmitter, HostBinding, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  label = input<string>('');
  loading = input<boolean>(false);
  loadingText = input<string>('');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit'>('button');
  fullWidth = input<boolean>(true);
  clicked = new EventEmitter<void>();

  @HostBinding('class.block') get hostBlock() {
    return this.fullWidth;
  }

  @HostBinding('class.inline-block') get hostInline() {
    return !this.fullWidth;
  }

  onClick() {
    if (this.type() === 'button' && !this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
