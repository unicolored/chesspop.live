import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucidePopcorn } from '@lucide/angular';

import { type LiveFeed } from '../../board/live.interface';
import { LiveBoardComponent } from '../../component/live-board/live-board.component';
import { LiveService } from '../../service/live.service';

@Component({
  selector: 'app-watch',
  imports: [LiveBoardComponent, LucidePopcorn, RouterModule],
  templateUrl: './watch.component.html',
  styleUrl: './watch.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class WatchComponent {
  liveService = inject(LiveService);

  selectedFeed = signal<LiveFeed>(this.liveService.defaultFeed.feed);
}
