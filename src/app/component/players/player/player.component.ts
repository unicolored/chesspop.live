import { Component, computed, input } from "@angular/core";
import { PlayerUI } from "../../../pages/page-live/feed.interface";

@Component({
  selector: "app-player",
  imports: [],
  template: `
    <div class="badge badge-lg">
      @if (p().color === "white") {
        <span class="text-xl">W::</span>
      } @else {
        <span class="text-xl">B::</span>
      }

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
}
