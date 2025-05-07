import { Component, computed, input, ViewEncapsulation } from "@angular/core";
import { PlayerUI } from "../../../pages/page-live/feed.interface";
import { FaDuotoneIconComponent } from "@fortawesome/angular-fontawesome";
import { faChessKing } from "@fortawesome/sharp-duotone-solid-svg-icons";

@Component({
  selector: "app-player",
  imports: [FaDuotoneIconComponent],
  template: `
    <div class="app-player">
      <div class="badge">
        <fa-duotone-icon
          class="text-gray-500 dark:text-gray-500"
          [title]="p().color === 'white' ? 'White' : 'Black'"
          [icon]="chessPiece"
          [fixedWidth]="true"
          [swapOpacity]="p().color === 'white'"
        ></fa-duotone-icon>

        @if (p().title) {
          <span class="btn btn-ghost px-1 font-mono">{{ p().title }}</span>
        } @else {
          <span class="btn btn-ghost px-1 font-mono">&nbsp;</span>
        }
      </div>

      <div class="flex w-full justify-start">
        <b>{{ p().name }}</b>
      </div>

      {{ p().rating }}
    </div>
  `,
})
export class PlayerComponent {
  player = input.required<Partial<PlayerUI>>();
  p = computed(() => this.player());
  protected readonly chessPiece = faChessKing;
}
