import { Component, computed, input, output } from "@angular/core";
import { PlayerUI } from "../../pages/page-live/feed.interface";
import { PlayerComponent } from "./player/player.component";

export interface BothPlayers {
  white: Partial<PlayerUI>;
  black: Partial<PlayerUI>;
}

@Component({
  selector: "app-players",
  imports: [PlayerComponent],
  template: `
    <div class="flex justify-between p-4">
      @let pw = playerWhite();
      @if (pw) {
        <app-player
          class="hover:cursor-pointer"
          [player]="pw"
          (click)="camera(pw.color)"
        ></app-player>
      }
      @let pb = playerBlack();
      @if (pb) {
        <app-player
          class="hover:cursor-pointer"
          [player]="pb"
          (click)="camera(pb.color)"
        ></app-player>
      }
    </div>
  `,
})
export class PlayersComponent {
  players = input.required<BothPlayers | undefined>();

  playerWhite = computed(() => {
    return this.players()?.white;
  });

  playerBlack = computed(() => {
    return this.players()?.black;
  });

  emitCameraCol = output<string | undefined>();

  camera(color: string | undefined) {
    if (color) {
      this.emitCameraCol.emit(color);
    }
  }
}
