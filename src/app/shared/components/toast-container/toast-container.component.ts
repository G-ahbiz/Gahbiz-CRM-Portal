import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastMessage } from '@core/interfaces/toaster-message';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toast: ToastMessage | null = null;
  private sub?: Subscription;
  private timeout?: any;

  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.sub = this.toastService.messages$.subscribe((msg) => {
      if (msg) {
        this.toast = msg;
        this.cdr.markForCheck();

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.toast = null;
          this.cdr.markForCheck();
        }, msg.duration ?? 3000);
      }
    });
  }

  dismiss() {
    this.toast = null;
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    clearTimeout(this.timeout);
  }
}
