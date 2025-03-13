import {
  AfterViewInit,
  Component,
  computed,
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
import { LichessTvFeed, PlayerUI } from "./feed.interface";
import { Subscription } from "rxjs";
import { Chessfield } from "chessfield";
import * as cg from "chessground/types";
import { StreamService } from "../../service/stream.service";
import { isPlatformBrowser } from "@angular/common";
import { Player, Players } from "../../board/lichess.interface";

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule],
  template: `
    <!--    <select [(ngModel)]="selectedChannel" (change)="loadChannel()">-->
    <!--      <option value="top">Top Rated</option>-->
    <!--      <option value="blitz">Blitz</option>-->
    <!--      <option value="bullet">Bullet</option>-->
    <!--    </select>-->
    <!--    <button (click)="randomFen()">random</button>-->

    <div class="players-wrap m-auto flex justify-between p-4">
      @if (playersComputed()) {
        <div class="badge badge-lg">
          <span class="mb-2 text-xl">♔</span>
          <b>{{ playersComputed().white.name }}</b>

          @if (playersComputed().white.title) {
            <span class="btn btn-ghost px-1">{{
              playersComputed().white.title
            }}</span>
          }
          <br />
          {{ playersComputed().white.rating }}
        </div>
        <div class="badge badge-lg">
          <span class="mb-2 text-xl">♚</span>
          <b>{{ playersComputed().black.name }}</b>

          @if (playersComputed().black.title) {
            <span class="btn btn-ghost px-1">{{
              playersComputed().black.title
            }}</span>
          }
          {{ playersComputed().black.rating }}
        </div>
      }
    </div>

    <div class="flex w-full justify-center">
      <div class="chessfield-wrap" #chessfield></div>
    </div>

    <!--    <div class="info-controls">-->
    <!--      <div class="controls">-->
    <!--        <button (click)="togglePause()">-->
    <!--          {{ isPaused ? "Resume" : "Pause" }}-->
    <!--        </button>-->
    <!--        <button (click)="toggleTheme()">Toggle Theme</button>-->
    <!--        <input-->
    <!--          type="range"-->
    <!--          min="200"-->
    <!--          max="800"-->
    <!--          [(ngModel)]="boardSize"-->
    <!--          (input)="updateSize()"-->
    <!--        />-->
    <!--      </div>-->
    <!--    </div>-->
  `,
  styleUrls: ["../pages.common.scss", "./live.component.scss"],
})
export class LiveComponent implements OnInit, AfterViewInit, OnDestroy {
  title = "chessfield-tv";

  selectedChannel = "top";
  isPaused = false;
  boardSize = 400;
  currentTheme = "light";

  streamService = inject(StreamService);

  items: LichessTvFeed[] = [];
  private subscription!: Subscription;

  randomFens: { fen: cg.FEN; lastMove: cg.Key[] }[] = [
    {
      fen: "8/8/4kpp1/3p4/p6P/2B4b/6P1/6K1 w - - 1 48",
      lastMove: ["f5", "h3"],
    },
    {
      fen: "2rq2kb/pbQr3p/2n1R1pB/1pp2pN1/3p4/P1PP2P1/1P3PBP/4R1K1 b - - 1 1",
      lastMove: ["f4", "c7"],
    },
    {
      fen: "5rk1/pp4pp/4p3/2R3Q1/3n4/6qr/P1P2PPP/5RK1 w - - 2 24",
      lastMove: ["c3", "g3"],
    },
    {
      fen: "r4k1r/1b2bPR1/p4n1B/3p4/4P2P/1q5B/PpP5/1K4R1 b - - 1 26",
      lastMove: ["e3", "h6"],
    },
    {
      fen: "8/6kp/6p1/4p3/p3rPRP/3K2P1/8/8 w - - 2 44",
      lastMove: ["f6", "g7"],
    },
  ];

  chessfieldElement = viewChild<ElementRef>("chessfield");

  players = signal<Player[] | null>(null);
  playersComputed = computed<{
    white: Partial<PlayerUI>;
    black: Partial<PlayerUI>;
  }>(() => {
    const players = this.players();
    let result = {
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

  previousId = -1;
  chessfield!: Chessfield;
  platformID = inject(PLATFORM_ID);

  constructor() {}

  ngOnInit() {
    this.loadChannel();
  }
  //

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformID)) {
      const element: HTMLCanvasElement =
        this.chessfieldElement()?.nativeElement;

      this.chessfield = new Chessfield(element, {
        // orientation: 'white',
        // camera: 'right',
      });
    }
  }

  loadChannel() {
    if (this.isPaused) return;

    // const stream = fetch('https://lichess.org/api/games/user/neio',{headers:{Accept:'application/x-ndjson'}});
    this.subscription = this.streamService
      .startTv("https://lichess.org/api/tv/feed")
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
              this.chessfield.setFen(data.d.fen, lastMove);
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

  togglePause() {
    // this.isPaused = !this.isPaused;
    if (!this.isPaused) this.loadChannel();
    this.streamService.stopTv();
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    // this.chessfield.setFen(this.chessfield['fen'], { theme: this.currentTheme }); // Assuming fen is accessible
  }

  updateSize() {
    // this.chessfield.updatePosition(this.chessfield['fen'], { size: this.boardSize });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.streamService.stopTv();
  }

  randomFen() {
    let id;
    do {
      id = Math.floor(Math.random() * this.randomFens.length);
    } while (id === this.previousId);

    this.previousId = id;

    const { fen, lastMove } = this.randomFens[id];
    this.chessfield.setFen(fen, lastMove);
  }
}
