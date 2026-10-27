import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideClock, LucidePopcorn, LucideRocket, LucideX, LucideZap } from '@lucide/angular';

import { type LiveFeed } from '../../board/live.interface';
import { HelpContentComponent } from '../../component/help/help-content.component';
import { LiveBoardComponent } from '../../component/live-board/live-board.component';
import { ThemeToggleComponent } from '../../component/theme-toggle/theme-toggle.component';
import { LiveService } from '../../service/live.service';

const HELP_HIDDEN_KEY = 'helpHidden';

@Component({
  selector: 'app-watch',
  imports: [
    HelpContentComponent,
    LiveBoardComponent,
    LucideClock,
    LucidePopcorn,
    LucideRocket,
    LucideX,
    LucideZap,
    ThemeToggleComponent,
    NgTemplateOutlet,
    RouterModule,
  ],
  templateUrl: './watch.component.html',
  styleUrl: './watch.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class WatchComponent implements AfterViewInit {
  liveService = inject(LiveService);
  platformID = inject(PLATFORM_ID);

  selectedFeed = signal<LiveFeed>(this.liveService.defaultFeed.feed);

  private menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private help = viewChild.required<ElementRef<HTMLDialogElement>>('help');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformID) && localStorage.getItem(HELP_HIDDEN_KEY) !== 'true') {
      this.openHelp();
    }
  }

  openMenu(): void {
    const menu = this.menu().nativeElement;
    if (!menu.open) {
      menu.showModal();
    }
  }

  closeMenu(): void {
    this.menu().nativeElement.close();
  }

  openHelp(): void {
    if (this.menu().nativeElement.open) {
      this.closeMenu();
    }

    const help = this.help().nativeElement;
    if (!help.open) {
      help.showModal();
    }
  }

  hideHelp(): void {
    if (isPlatformBrowser(this.platformID)) {
      localStorage.setItem(HELP_HIDDEN_KEY, 'true');
    }
    this.help().nativeElement.close();
  }

  selectFeed(feed: LiveFeed): void {
    this.selectedFeed.set(feed);
    if (this.menu().nativeElement.open) {
      this.closeMenu();
    }
  }

  onBackdropClick(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === event.currentTarget) {
      dialog.close();
    }
  }
}
