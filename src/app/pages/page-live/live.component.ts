import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  type ElementRef,
  inject,
  type OnDestroy,
  type OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import type * as cg from '@lichess-org/chessground/types';
import { BLACK, Chess, KING, WHITE } from 'chess.js';
import { type Angle, type Camera, Chessfield, type ChessfieldConfig, type GameState } from 'chessfield';
import { fromEvent, startWith, Subject, type Subscription, switchMap, takeUntil } from 'rxjs';

import { type Player } from '../../board/lichess.interface';
import { type BothPlayers, PlayersComponent } from '../../component/players/players.component';
import { AudioService } from '../../service/audio.service';
import { ChessfieldService } from '../../service/chessfield.service';
import { StreamService } from '../../service/stream.service';
import { ThemeService } from '../../service/theme.service';

import { type LichessTvFeed, type LiveFeed } from './feed.interface';
import { LiveService } from './live.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule, PlayersComponent],
  templateUrl: 'live.component.html',
  styleUrls: ['./live.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class LiveComponent implements OnInit, OnDestroy {
  title = 'chessfield-tv';

  selectedLiveFeed!: LiveFeed;
  isPaused = false;

  streamService = inject(StreamService);

  private subscription!: Subscription;

  chessfieldElement = viewChild<ElementRef>('chessfield');

  players = signal<Player[] | null>(null);
  playersComputed = computed<BothPlayers>(() => {
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
  chessfieldService = inject(ChessfieldService);

  canvasElement!: HTMLCanvasElement;

  private destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      const el = this.chessfieldElement();

      if (el) {
        this.canvasElement = el.nativeElement;
        this.initChessfield();
      }
    });
    effect(() => {
      const isDarkMode = this.themeService.isDarkMode();
      if (this.canvasElement && this.chessfield) {
        this.updateCamera(isDarkMode ? 'dark' : 'light');
      }
    });
  }

  ngOnInit() {
    this.streamService.isLoadingSignal.set(true);

    if (this.themeService.isSoundsOn()) {
      this.audioService.initSounds();
    }

    this.loadChannel(this.liveService.defaultFeed.feed);
  }

  loadChannel(feed: LiveFeed = this.liveService.defaultFeed.feed) {
    if (this.isPaused) return;

    this.resetFeed();

    const liveFeedItem = this.liveService.getLiveFeedItem(feed);

    this.selectedLiveFeed = liveFeedItem.feed;

    if (isPlatformBrowser(this.platformID)) {
      const visibility$ = fromEvent(document, 'visibilitychange').pipe(
        takeUntil(this.destroy$), // Cleanup on component destroy
      );

      const chessMoves$ = this.streamService.startTv(liveFeedItem.url);

      visibility$
        .pipe(
          startWith(null),
          switchMap(() => chessMoves$),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (data: LichessTvFeed | null) => {
            this.chessjs = null;

            if (data) {
              // console.log('feed data', data);

              if (data.t === 'fen') {
                this.chessjs = new Chess(data.d.fen);
                // TODO: check fen for state: gameover, check, etc.

                const lastMove = data.d.lm?.match(/.{1,2}/g) as cg.Key[];
                if (this.chessfield) {
                  this.audioService.playSound(133, 'sine', 0.1);
                  this.chessfield.setFen(data.d.fen, lastMove);

                  if (this.chessjs.isGameOver()) {
                    if (this.chessjs.isCheckmate()) {
                      this.audioService.playSound(99, 'sine', 0.1);
                      // Winner is the OPPOSITE of the side to move (they just got checkmated)
                      const winner = this.chessjs.turn() === WHITE ? BLACK : WHITE;
                      // const loser = winner === WHITE ? BLACK : WHITE;
                      console.log(`Checkmate! Winner: ${winner}`);

                      const findBlackKing = this.chessjs.findPiece({ type: KING, color: BLACK });
                      const findWhiteKing = this.chessjs.findPiece({ type: KING, color: WHITE });
                      // -> ['e8']
                      // console.log(`Mate king ${loser} on:`, findMateKing);
                      // console.log(`Winner king ${winner} on:`, findWinnerKing);
                      // console.log(`${headers[winner]} wins over ${headers[loser]}`);

                      const gO: GameState = {
                        winner,
                        kings: {
                          white: findWhiteKing.pop(),
                          black: findBlackKing.pop(),
                        },
                      };
                      this.chessfield.setGameOver(gO);
                      console.log('Checkmate', gO);
                    } else if (this.chessjs.isDraw()) {
                      // It's a draw - check specific reason
                      console.log('Draw!');
                      // console.log(`${headers[WHITE]} draw ${headers[BLACK]}`);
                      console.log('Stalemate:', this.chessjs.isStalemate());
                      console.log('Threefold repetition:', this.chessjs.isThreefoldRepetition());
                      console.log('50-move rule:', this.chessjs.isDrawByFiftyMoves());
                      console.log('Insufficient material:', this.chessjs.isInsufficientMaterial());

                      const findBlackKing = this.chessjs.findPiece({ type: KING, color: BLACK });
                      const findWhiteKing = this.chessjs.findPiece({ type: KING, color: WHITE });

                      const gO: GameState = {
                        kings: {
                          white: findWhiteKing.pop(),
                          black: findBlackKing.pop(),
                        },
                      };
                      this.chessfield.setGameOver(gO);
                      console.log('Draw', gO);
                    }
                  } else if (this.chessjs.isCheck()) {
                    const findCheckKing = this.chessjs.findPiece({ type: KING, color: this.chessjs.turn() });
                    // -> ['e8']
                    const checkState: GameState = {
                      status: 'check',
                      kings: {
                        white: this.chessjs.turn() === 'w' ? findCheckKing.pop() : undefined,
                        black: this.chessjs.turn() === 'b' ? findCheckKing.pop() : undefined,
                      },
                    };

                    this.chessfield.setCheck(checkState);
                    console.log('Check', checkState);
                  } else if (data.d.wc === 0 || data.d.bc === 0) {
                    let winner;
                    if (data.d.wc === 0) {
                      winner = BLACK as 'b';
                    } else if (data.d.bc === 0) {
                      winner = WHITE as 'w';
                    }
                    const findTimeWhiteKing = this.chessjs.findPiece({ type: KING, color: WHITE });
                    const findTimeBlackKing = this.chessjs.findPiece({ type: KING, color: BLACK });
                    const gOtime: GameState = {
                      status: 'timeout',
                      winner,
                      kings: {
                        white: findTimeWhiteKing.pop(),
                        black: findTimeBlackKing.pop(),
                      },
                    };
                    this.chessfield.setGameOver(gOtime);
                    console.log('Timeout', gOtime);
                  }
                }
              }

              if (data.t === 'featured') {
                const players = data.d.players;
                if (players) {
                  this.players.set(players);

                  const whitePlayerTitle = this.playersComputed().white.title
                    ? `${this.playersComputed().white.title} `
                    : '';
                  const whitePlayerName = `${whitePlayerTitle}${this.playersComputed().white.name ?? '<pop>'}`;
                  this.chessjs?.setHeader('White', whitePlayerName);
                  this.chessjs?.setHeader('WHITE', whitePlayerName);

                  const blackPlayerTitle = this.playersComputed().black.title
                    ? `${this.playersComputed().black.title} `
                    : '';
                  const blackPlayerName = `${blackPlayerTitle}${this.playersComputed().black.name ?? '<pop>'}`;
                  this.chessjs?.setHeader('Black', blackPlayerName);
                  this.chessjs?.setHeader('BLACK', blackPlayerName);

                  // chess.setHeader('Date', '1858-??-??');
                }
              }
            }
          },
          error: err => {
            console.error('Stream error:', err);
          },
          complete: () => {
            console.log('Stream completed');
          },
        });
    }
  }

  resetFeed(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.destroy$.next();
      this.destroy$.complete();
    }
    this.streamService.stopTv();
  }

  ngOnDestroy(): void {
    this.chessfieldService.unregister();
    this.resetFeed();
  }

  updateCamera(event: string | undefined) {
    console.log('updateCamera', event);

    const options: ChessfieldConfig = {
      camera: event as Camera,
      angle: 'center' as Angle,
      mode: this.themeService.isDarkMode() ? 'dark' : 'light',
    };

    this.chessfield.configUpdate(options);
  }

  initChessfield() {
    if (isPlatformBrowser(this.platformID)) {
      this.streamService.isLoadingSignal.set(false);

      this.chessfield = new Chessfield(this.canvasElement, {
        plugins: {
          themes: {
            chesspop: {
              light: '#e3dbc9',
              dark: '#cb4444',
              highlight: '#c99a39',
              statusCheck: '#ffff00',
              selected: 'orange',
            },
          },
        },
        theme: 'chesspop',
        camera: 'white',
        angle: 'right',
        mode: this.themeService.isDarkMode() ? 'dark' : 'light',
      });

      // Register with service for global theme switching
      this.chessfieldService.register(this.chessfield);
    }
  }
}
