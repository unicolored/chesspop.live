import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideChessKing } from '@lucide/angular';

import { type PlayerUI } from '../../../board/live.interface';

@Component({
  selector: 'app-player',
  imports: [LucideChessKing],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="app-player">
      <div class="badge">
        <span
          class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1"
          [class.bg-white]="isWhite()"
          [class.text-neutral-800]="isWhite()"
          [class.ring-neutral-400]="isWhite()"
          [class.bg-neutral-950]="!isWhite()"
          [class.text-white]="!isWhite()"
          [class.ring-neutral-500]="!isWhite()">
          <svg lucideChessKing class="h-4 w-4" [title]="isWhite() ? 'White' : 'Black'"></svg>
        </span>

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
  isWhite = computed(() => this.p().color === 'white');
}
