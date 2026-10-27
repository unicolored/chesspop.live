import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucidePopcorn, LucideX } from '@lucide/angular';

import { type LiveFeed } from '../../board/live.interface';
import { LiveBoardComponent } from '../../component/live-board/live-board.component';
import { ThemeToggleComponent } from '../../component/theme-toggle/theme-toggle.component';
import { LiveService } from '../../service/live.service';

@Component({
  selector: 'app-watch',
  imports: [LiveBoardComponent, LucidePopcorn, LucideX, ThemeToggleComponent, NgTemplateOutlet, RouterModule],
  templateUrl: './watch.component.html',
  styleUrl: './watch.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class WatchComponent {
  liveService = inject(LiveService);

  selectedFeed = signal<LiveFeed>(this.liveService.defaultFeed.feed);

  private menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  openMenu(): void {
    const menu = this.menu().nativeElement;
    if (!menu.open) {
      menu.showModal();
    }
  }

  closeMenu(): void {
    this.menu().nativeElement.close();
  }

  selectFeed(feed: LiveFeed): void {
    this.selectedFeed.set(feed);
    if (this.menu().nativeElement.open) {
      this.closeMenu();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeMenu();
    }
  }
}
