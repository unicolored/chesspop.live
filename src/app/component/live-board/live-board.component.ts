import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  type ElementRef,
  inject,
  input,
  type OnDestroy,
  type OnInit,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import type * as cg from '@lichess-org/chessground/types';
import { LucideChessKing } from '@lucide/angular';
import { BLACK, Chess, KING, WHITE } from 'chess.js';
import { Chessfield, type GameState, type TimeLeft } from 'chessfield';
import { EMPTY, fromEvent, type Observable, startWith, type Subscription, switchMap, tap } from 'rxjs';

import { CHESSPOP_THEME, CHESSPOP_THEME_NAME } from '../../board/chessfield-themes';
import { type LichessStreamData, type Player } from '../../board/lichess.interface';
import { type LichessTvFeed, type LiveFeed } from '../../board/live.interface';
import { AudioService } from '../../service/audio.service';
import { ChessfieldService } from '../../service/chessfield.service';
import { FullscreenService } from '../../service/fullscreen.service';
import { LiveService } from '../../service/live.service';
import { StreamService } from '../../service/stream.service';
import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-live-board',
  templateUrl: './live-board.component.html',
  styleUrls: ['./live-board.component.css'],
  imports: [LucideChessKing],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class LiveBoardComponent implements OnInit, OnDestroy {
  /** Feed selected by the surrounding layout. Changing it switches the Lichess stream. */
  feed = input.required<LiveFeed>();

  /** Connection state of the current feed, surfaced as an overlay on the board. */
  readonly status = signal<'connecting' | 'live' | 'error'>('connecting');

  /** Players of the featured game, listed below the board in white-then-black order. */
  readonly players = signal<Player[]>([]);
  readonly orderedPlayers = computed(() => {
    const players = this.players();
    const white = players.find(player => player.color === 'white');
    const black = players.find(player => player.color === 'black');
    return [white, black].filter((player): player is Player => player !== undefined);
  });

  chessfield!: Chessfield;
  platformID = inject(PLATFORM_ID);
  themeService = inject(ThemeService);
  audioService = inject(AudioService);
  liveService = inject(LiveService);
  streamService = inject(StreamService);
  chessfieldService = inject(ChessfieldService);
  fullscreenService = inject(FullscreenService);

  readonly liveFeedItem = computed(() => this.liveService.getLiveFeedItem(this.feed()));
  readonly channelLabel = computed(() => `${this.liveFeedItem().platform} · ${this.liveFeedItem().type}`);

  chessfieldElement = viewChild<ElementRef>('chessfield');

  private wrapperElement!: HTMLElement;
  private streamSubscription?: Subscription;

  constructor() {
    effect(() => {
      const el = this.chessfieldElement();

      if (el) {
        this.wrapperElement = el.nativeElement;
        // Untracked: the board is built once. Theme, camera and mode changes are
        // pushed to the existing instance by the services, not by rebuilding it.
        untracked(() => this.initChessfield());
      }
    });
    effect(() => {
      this.feed();
      untracked(() => this.loadChannel());
    });
    effect(() => {
      const isDarkMode = this.themeService.isDarkMode();
      if (this.wrapperElement && this.chessfield) {
        this.chessfield.switchMode(isDarkMode ? 'dark' : 'light');
      }
    });
  }

  ngOnInit(): void {
    if (this.themeService.isSoundsOn()) {
      this.audioService.initSounds(true);
    }
  }

  retry(): void {
    this.loadChannel();
  }

  /** Rotate the board to the clicked player's side, as the old players list did. */
  focusPlayer(color: string): void {
    if (color === 'white' || color === 'black') {
      this.chessfieldService.switchCamera(color);
    }
  }

  /** Title and name of a player, e.g. "GM Alice". */
  playerLabel(player: Player): string {
    const title = player.user.title ? `${player.user.title} ` : '';
    return `${title}${player.user.name ?? '<pop>'}`;
  }

  private loadChannel(): void {
    this.resetFeed();
    this.players.set([]);
    this.status.set('connecting');

    if (!isPlatformBrowser(this.platformID)) {
      return;
    }

    const streamUrl = this.liveFeedItem().url;
    const visibility$ = fromEvent(document, 'visibilitychange');

    this.streamSubscription = visibility$
      .pipe(
        startWith(null),
        switchMap(() => (document.visibilityState === 'visible' ? this.connect(streamUrl) : EMPTY)),
      )
      .subscribe({
        next: data => this.onTvFeed(data),
        error: err => {
          console.error('Stream error:', err);
          this.status.set('error');
        },
      });
  }

  /**
   * Opens the feed and reports a server-side close as an error, so the board
   * offers a retry instead of silently showing a frozen position.
   */
  private connect(streamUrl: string): Observable<LichessTvFeed> {
    this.status.set('connecting');

    return this.streamService.startTv(streamUrl).pipe(
      tap({
        complete: () => this.status.set('error'),
      }),
    );
  }

  private onTvFeed(data: LichessTvFeed): void {
    if (data.t === 'fen') {
      this.applyFen(data.d);
    } else if (data.t === 'featured') {
      void this.applyFeatured(data.d).catch(err => {
        console.error('Featured update failed:', err);
        this.status.set('error');
      });
    }
  }

  private applyFen(data: LichessStreamData): void {
    const chess = new Chess(data.fen);

    const lastMove = data.lm?.match(/.{1,2}/g) as cg.Key[];

    if (!this.chessfield) {
      return;
    }

    this.audioService.playSound(133, 'sine', 0.1);
    this.chessfield.setFen(data.fen, lastMove, this.timeLeftOf(data));
    this.status.set('live');

    if (chess.isGameOver()) {
      this.applyGameOver(chess);
    } else if (data.wc === 0 || data.bc === 0) {
      this.applyTimeout(chess, data);
    } else if (chess.isCheck()) {
      this.applyCheck(chess);
    }
  }

  /**
   * Lichess reports both clocks in whole seconds on every move; a one-sided
   * snapshot cannot anchor the countdown, so it is dropped.
   */
  private timeLeftOf(data: LichessStreamData): TimeLeft | undefined {
    const { wc, bc } = data;

    return wc !== undefined && bc !== undefined ? { white: wc, black: bc } : undefined;
  }

  /** The `featured` event carries each player's remaining seconds instead of wc/bc. */
  private timeLeftOfPlayers(players: Player[]): TimeLeft | undefined {
    const white = players.find(player => player.color === 'white')?.seconds;
    const black = players.find(player => player.color === 'black')?.seconds;

    return white !== undefined && black !== undefined ? { white, black } : undefined;
  }

  private applyGameOver(chess: Chess): void {
    if (chess.isCheckmate()) {
      this.audioService.playSound(99, 'sine', 0.1);
      // Winner is the OPPOSITE of the side to move (they just got checkmated)
      const winner = chess.turn() === WHITE ? BLACK : WHITE;
      console.log(`Checkmate! Winner: ${winner}`);

      const findBlackKing = chess.findPiece({ type: KING, color: BLACK }).pop();
      const findWhiteKing = chess.findPiece({ type: KING, color: WHITE }).pop();

      const mate = [];
      if (winner === WHITE && findBlackKing) {
        mate.push(findBlackKing);
      } else if (winner === BLACK && findWhiteKing) {
        mate.push(findWhiteKing);
      }

      const gameState: GameState = {
        winner,
        kings: {
          white: findWhiteKing,
          black: findBlackKing,
        },
        mate,
      };
      this.chessfield.setState(gameState);
      console.log('Checkmate', gameState);
    } else if (chess.isDraw()) {
      console.log('Draw!');
      console.log('Stalemate:', chess.isStalemate());
      console.log('Threefold repetition:', chess.isThreefoldRepetition());
      console.log('50-move rule:', chess.isDrawByFiftyMoves());
      console.log('Insufficient material:', chess.isInsufficientMaterial());

      const findBlackKing = chess.findPiece({ type: KING, color: BLACK }).pop();
      const findWhiteKing = chess.findPiece({ type: KING, color: WHITE }).pop();

      const draw = [];
      if (findWhiteKing) {
        draw.push(findWhiteKing);
      }
      if (findBlackKing) {
        draw.push(findBlackKing);
      }

      const gameState: GameState = {
        kings: {
          white: findWhiteKing,
          black: findBlackKing,
        },
        draw,
      };
      this.chessfield.setState(gameState);
      console.log('Draw', gameState);
    }
  }

  private applyCheck(chess: Chess): void {
    const findCheckKing = chess.findPiece({ type: KING, color: chess.turn() }).pop();

    const check = [];
    if (findCheckKing) {
      check.push(findCheckKing);
    }
    const checkState: GameState = {
      status: 'check',
      check,
    };

    this.chessfield.setState(checkState);
    console.log('Check', checkState);
  }

  private applyTimeout(chess: Chess, data: LichessStreamData): void {
    let winner;
    if (data.wc === 0) {
      winner = BLACK as 'b';
    } else if (data.bc === 0) {
      winner = WHITE as 'w';
    }
    const findTimeWhiteKing = chess.findPiece({ type: KING, color: WHITE }).pop();
    const findTimeBlackKing = chess.findPiece({ type: KING, color: BLACK }).pop();
    const gameState: GameState = {
      status: 'timeout',
      winner,
      kings: {
        white: findTimeWhiteKing,
        black: findTimeBlackKing,
      },
    };
    this.chessfield.setState(gameState);
    console.log('Timeout', gameState);
  }

  private async applyFeatured(data: LichessStreamData): Promise<void> {
    // `featured` carries the current position: show it right away instead of
    // keeping the previous channel's game until the next move arrives.
    const players = data.players;

    if (data.fen && this.chessfield) {
      this.chessfield.setFen(data.fen, undefined, players ? this.timeLeftOfPlayers(players) : undefined);
      this.chessfield.setState({});
    }

    if (!players) {
      this.status.set('live');
      return;
    }

    const label = (color: 'white' | 'black'): string => {
      const player = players.find(p => p.color === color);
      return player ? this.playerLabel(player) : '<pop>';
    };

    // DOM names update immediately; the canvas labels follow once the scene has
    // rebuilt them.
    this.players.set(players);

    await this.chessfield?.configUpdate({
      playerNames: { white: label('white'), black: label('black') },
    });

    this.status.set('live');
  }

  private resetFeed(): void {
    this.streamSubscription?.unsubscribe();
    this.streamSubscription = undefined;
  }

  ngOnDestroy(): void {
    this.resetFeed();
    this.chessfieldService.unregister();
    this.fullscreenService.unregisterWrapper();
  }

  private initChessfield(): void {
    if (isPlatformBrowser(this.platformID)) {
      this.chessfield = new Chessfield(this.wrapperElement, {
        plugins: {
          themes: {
            [CHESSPOP_THEME_NAME]: CHESSPOP_THEME,
          },
        },
        playerNames: {
          white: 'white!',
          black: 'black!',
        },
        text: {
          backend: 'canvas-sprite',
          fontSize: 0.006,
          offset: 0.07,
          color: '#fff',
        },
        theme: this.chessfieldService.currentTheme(),
        camera: this.chessfieldService.currentCamera(),
        angle: this.chessfieldService.currentCameraAngle(),
        mode: this.themeService.isDarkMode() ? 'dark' : 'light',
      });

      // Register with service for global theme switching
      this.chessfieldService.register(this.chessfield);

      // Register wrapper for fullscreen support
      this.fullscreenService.registerWrapper(this.wrapperElement);
    }
  }
}
