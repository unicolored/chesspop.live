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
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import type * as cg from '@lichess-org/chessground/types';
import { BLACK, Chess, KING, WHITE } from 'chess.js';
import { Chessfield, type GameState } from 'chessfield';
import { fromEvent, startWith, type Subscription, switchMap } from 'rxjs';

import { CHESSPOP_THEME, CHESSPOP_THEME_NAME } from '../../board/chessfield-themes';
import { type LichessStreamData, type Player } from '../../board/lichess.interface';
import { type LichessTvFeed, type LiveFeed } from '../../board/live.interface';
import { AudioService } from '../../service/audio.service';
import { ChessfieldService } from '../../service/chessfield.service';
import { FullscreenService } from '../../service/fullscreen.service';
import { LiveService } from '../../service/live.service';
import { StreamService } from '../../service/stream.service';
import { ThemeService } from '../../service/theme.service';
import { type BothPlayers } from '../players/players.component';

@Component({
  selector: 'app-live-board',
  templateUrl: './live-board.component.html',
  styleUrls: ['./live-board.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class LiveBoardComponent implements OnInit, OnDestroy {
  /** Feed selected by the surrounding layout. Changing it switches the Lichess stream. */
  feed = input.required<LiveFeed>();
  /** Emits the players of the featured game so a layout can render them next to the board. */
  playersChange = output<BothPlayers>();

  private players = signal<Player[] | null>(null);
  private playersComputed = computed<BothPlayers>(() => {
    const players = this.players();
    const result: BothPlayers = {
      white: {},
      black: {},
    };
    if (players) {
      const playerWhite = players.find(p => p.color === 'white');
      const playerBlack = players.find(p => p.color === 'black');

      if (playerWhite) {
        result.white = {
          id: playerWhite.user.id,
          title: playerWhite.user.title,
          name: playerWhite.user.name,
          rating: playerWhite.rating,
          color: playerWhite.color,
        };
      }

      if (playerBlack) {
        result.black = {
          id: playerBlack.user.id,
          title: playerBlack.user.title,
          name: playerBlack.user.name,
          rating: playerBlack.rating,
          color: playerBlack.color,
        };
      }
    }
    return result;
  });

  chessfield!: Chessfield;
  chessjs!: Chess | null;
  platformID = inject(PLATFORM_ID);
  themeService = inject(ThemeService);
  audioService = inject(AudioService);
  liveService = inject(LiveService);
  streamService = inject(StreamService);
  chessfieldService = inject(ChessfieldService);
  fullscreenService = inject(FullscreenService);

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
      const feed = this.feed();
      untracked(() => this.loadChannel(feed));
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

  private loadChannel(feed: LiveFeed): void {
    this.resetFeed();

    const liveFeedItem = this.liveService.getLiveFeedItem(feed);

    if (isPlatformBrowser(this.platformID)) {
      const visibility$ = fromEvent(document, 'visibilitychange');
      const chessMoves$ = this.streamService.startTv(liveFeedItem.url);

      this.streamSubscription = visibility$
        .pipe(
          startWith(null),
          switchMap(() => chessMoves$),
        )
        .subscribe({
          next: data => this.onTvFeed(data),
          error: err => {
            console.error('Stream error:', err);
          },
          complete: () => {
            console.log('Stream completed');
          },
        });
    }
  }

  private onTvFeed(data: LichessTvFeed): void {
    if (data.t === 'fen') {
      this.applyFen(data.d);
    } else if (data.t === 'featured') {
      this.applyFeatured(data.d);
    }
  }

  private applyFen(data: LichessStreamData): void {
    const chess = new Chess(data.fen);
    this.chessjs = chess;

    const lastMove = data.lm?.match(/.{1,2}/g) as cg.Key[];

    if (!this.chessfield) {
      return;
    }

    this.audioService.playSound(133, 'sine', 0.1);
    this.chessfield.setFen(data.fen, lastMove);

    if (chess.isGameOver()) {
      this.applyGameOver(chess);
    } else if (chess.isCheck()) {
      this.applyCheck(chess);
    } else if (data.wc === 0 || data.bc === 0) {
      this.applyTimeout(chess, data);
    }
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

  private applyFeatured(data: LichessStreamData): void {
    const players = data.players;
    if (!players) {
      return;
    }

    this.players.set(players);
    const bothPlayers = this.playersComputed();
    this.playersChange.emit(bothPlayers);

    const whitePlayerTitle = bothPlayers.white.title ? `${bothPlayers.white.title} ` : '';
    const whitePlayerName = `${whitePlayerTitle}${bothPlayers.white.name ?? '<pop>'}`;
    const blackPlayerTitle = bothPlayers.black.title ? `${bothPlayers.black.title} ` : '';
    const blackPlayerName = `${blackPlayerTitle}${bothPlayers.black.name ?? '<pop>'}`;

    this.chessjs?.setHeader('White', whitePlayerName);
    this.chessjs?.setHeader('WHITE', whitePlayerName);
    this.chessjs?.setHeader('Black', blackPlayerName);
    this.chessjs?.setHeader('BLACK', blackPlayerName);

    this.chessfield?.configUpdate({
      playerNames: { white: whitePlayerName, black: blackPlayerName },
    });
  }

  private resetFeed(): void {
    this.streamSubscription?.unsubscribe();
    this.streamSubscription = undefined;
    this.streamService.stopTv();
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
