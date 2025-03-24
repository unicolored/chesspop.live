import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { LichessTvFeed, LiveFeed, LiveFeedItem } from "./feed.interface";
import {
  fromEvent,
  startWith,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from "rxjs";
import { Chessfield } from "chessfield";
import * as cg from "chessground/types";
import { StreamService } from "../../service/stream.service";
import { isPlatformBrowser } from "@angular/common";
import { Player } from "../../board/lichess.interface";
import {
  BothPlayers,
  PlayersComponent,
} from "../../component/players/players.component";
import { ThemeService } from "../../service/theme.service";
import { AudioService } from "../../service/audio.service";
import { LiveService } from "./live.service";

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule, PlayersComponent],
  templateUrl: "live.component.html",
  styleUrls: ["../pages.common.scss", "./live.component.scss"],
})
export class LiveComponent implements OnInit, OnDestroy {
  title = "chessfield-tv";

  selectedLiveFeed!: LiveFeed;
  isPaused = false;

  streamService = inject(StreamService);

  private subscription!: Subscription;

  chessfieldElement = viewChild<ElementRef>("chessfield");

  players = signal<Player[] | null>(null);
  playersComputed = computed<BothPlayers>(() => {
    const players = this.players();
    let result: BothPlayers = {
      white: {},
      black: {},
    };
    if (players) {
      const playerWhite = players.find((p) => p.color === "white");
      const playerBlack = players.find((p) => p.color === "black");

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
  platformID = inject(PLATFORM_ID);
  themeService = inject(ThemeService);
  audioService = inject(AudioService);
  liveService = inject(LiveService);

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
        this.updateCamera(isDarkMode ? "dark" : "light");
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

    console.log(feed);
    const liveFeedItem = this.liveService.getLiveFeedItem(feed);

    this.selectedLiveFeed = liveFeedItem.feed;

    console.log(liveFeedItem);

    if (isPlatformBrowser(this.platformID)) {
      const visibility$ = fromEvent(document, "visibilitychange").pipe(
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
            if (data) {
              if (data.t === "featured") {
                const players = data.d.players;
                if (players) {
                  this.players.set(players);
                }
              }
              if (data.t === "fen") {
                const lastMove = data.d.lm?.match(/.{1,2}/g) as cg.Key[];
                if (this.chessfield) {
                  this.audioService.playSound(133, "sine", 0.1);
                  this.chessfield.setFen(data.d.fen, lastMove);
                }
              }
            }
          },
          error: (err) => {
            console.error("Stream error:", err);
          },
          complete: () => {
            console.log("Stream completed");
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
    this.resetFeed();
  }

  updateCamera(event: string | undefined) {
    console.log("updateCamera", event);

    const options = {
      // @ts-ignore
      camera: event as Camera,
      // @ts-ignore
      angle: "center" as Angle,
      mode: this.themeService.isDarkMode() ? "dark" : "light",
    };

    // @ts-ignore
    this.chessfield.configUpdate(options);
  }

  initChessfield() {
    if (isPlatformBrowser(this.platformID)) {
      this.streamService.isLoadingSignal.set(false);

      this.chessfield = new Chessfield(this.canvasElement, {
        plugins: {
          themes: {
            chesspop: {
              light: "#e3dbc9",
              dark: "#cb4444",
              highlight: "#c99a39",
              selected: "orange",
            },
          },
        },
        theme: "chesspop",
        camera: "white",
        angle: "right",
      });
    }
  }
}
