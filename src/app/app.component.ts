import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucidePopcorn } from '@lucide/angular';

import { StreamService } from './service/stream.service';
import { ThemeService } from './service/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LucidePopcorn],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'chessfield-live';

  streamService = inject(StreamService);
  themeService = inject(ThemeService);
}
