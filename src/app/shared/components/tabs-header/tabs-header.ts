import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { LanguageService } from '@core/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LogCard } from '@shared/interfaces/log-card';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-tabs-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tabs-header.html',
  styleUrl: './tabs-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsHeader implements OnInit {
  icon = input<string>('');
  title = input<string>('');
  cardsData = input<LogCard[]>([]);
  folderName = input<string>('');

  languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  get directionClass() {
    return this.languageService.getFlexDirectionClass();
  }

  get textAlignmentClass() {
    return this.languageService.getTextAlignmentClass();
  }

  ngOnInit() {}

  getTranslatedTitle$(card: LogCard): Observable<string> {
    const key = `${card.title.toUpperCase().replace(/\s+/g, '_')}`;
    return this.translate.stream(key).pipe(map((translation) => translation || card.title));
  }
}
