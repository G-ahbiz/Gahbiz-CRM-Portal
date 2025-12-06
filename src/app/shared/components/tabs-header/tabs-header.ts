import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LogCard } from '@shared/interfaces/log-card';

@Component({
  selector: 'app-tabs-header',
  imports: [],
  templateUrl: './tabs-header.html',
  styleUrl: './tabs-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsHeader {
  icon = input<string>('');
  title = input<string>('');
  cardsData = input<LogCard[]>([]);
  folderName = input<string>('');
}
