import { Component, computed, input } from "@angular/core";
import { PlayerUI } from "../../../pages/page-live/feed.interface";
import { FaDuotoneIconComponent } from "@fortawesome/angular-fontawesome";
import { faChessKing } from "@fortawesome/sharp-duotone-solid-svg-icons";

@Component({
  selector: "app-player",
  imports: [FaDuotoneIconComponent],
  template: `
    <div class="badge badge-lg">
      <div class="badge badge-outline badge-neutral">
        <fa-duotone-icon
          class="text-gray-500 dark:text-gray-500"
          [title]="p().color === 'white' ? 'White' : 'Black'"
          [icon]="chessPiece"
          [fixedWidth]="true"
          [swapOpacity]="p().color === 'white'"
        ></fa-duotone-icon>
      </div>

      <b>{{ p().name }}</b>

      @if (p().title) {
        <span class="btn btn-ghost px-1">{{ p().title }}</span>
      }
      <br />
      {{ p().rating }}
    </div>
  `,
  styleUrl: "./player.component.css",
})
export class PlayerComponent {
  player = input.required<Partial<PlayerUI>>();
  p = computed(() => this.player());
  protected readonly chessPiece = faChessKing;
}
