import { Component, computed, input, ViewEncapsulation } from "@angular/core";
import { PlayerUI } from "../../../pages/page-live/feed.interface";

@Component({
  selector: "app-player",
  imports: [],
  template: `
    <div class="app-player">
      <div class="badge">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-500" viewBox="0 0 24 24" fill="currentColor" [title]="p().color === 'white' ? 'White' : 'Black'">
          <path d="M12 2a2 2 0 0 0-2 2v3H8a2 2 0 0 0-2 2v1H4v2h2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7h2v-2h-2V9a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2zm-2 7v3h-2V9h2zm4 0v3h-2V9h2z"/>
        </svg>

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
}
