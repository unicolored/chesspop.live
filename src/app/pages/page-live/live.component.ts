import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';

import { type LiveFeed } from '../../board/live.interface';
import { LiveBoardComponent } from '../../component/live-board/live-board.component';
import { type BothPlayers, PlayersComponent } from '../../component/players/players.component';
import { ThemeToggleComponent } from '../../component/theme-toggle/theme-toggle.component';
import { ChessfieldService } from '../../service/chessfield.service';
import { LiveService } from '../../service/live.service';

@Component({
  imports: [LiveBoardComponent, PlayersComponent, ThemeToggleComponent],
  templateUrl: 'live.component.html',
  styleUrls: ['./live.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class LiveComponent {
  liveService = inject(LiveService);
  chessfieldService = inject(ChessfieldService);

  selectedFeed = signal<LiveFeed>(this.liveService.defaultFeed.feed);
  players = signal<BothPlayers | undefined>(undefined);

  setCameraForPlayer(color: string | undefined) {
    if (color === 'white' || color === 'black') {
      this.chessfieldService.switchCamera(color);
    }
  }
}
