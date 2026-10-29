import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideClock, LucidePopcorn, LucideRocket, LucideX, LucideZap } from '@lucide/angular';

import { type LiveFeed } from '../../board/live.interface';
import { HelpContentComponent } from '../../component/help/help-content.component';
import { LiveBoardComponent } from '../../component/live-board/live-board.component';
import { ThemeToggleComponent } from '../../component/theme-toggle/theme-toggle.component';
import { LiveService } from '../../service/live.service';

const HELP_HIDDEN_KEY = 'helpHidden';
const CHANNEL_PARAM = 'channel';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedFeed = signal<LiveFeed>(this.feedFromUrl() ?? this.liveService.defaultFeed.feed);
  readonly channel = computed(() => this.liveService.getLiveFeedItem(this.selectedFeed()));
  readonly nextChannel = computed(() => this.liveService.getNextFeed(this.selectedFeed()));
  /** Accessible name of the channel badge; its visible text is just the speed. */
  readonly channelLabel = computed(() => `${this.channel().platform} ${this.channel().type}`);

  private menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private help = viewChild.required<ElementRef<HTMLDialogElement>>('help');

  private feedFromUrl(): LiveFeed | null {
    return this.liveService.getFeedByType(this.route.snapshot.queryParamMap.get(CHANNEL_PARAM))?.feed ?? null;
  }

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

    const channel = this.liveService.getLiveFeedItem(feed).type;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [CHANNEL_PARAM]: channel },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    if (this.menu().nativeElement.open) {
      this.closeMenu();
    }
  }

  cycleChannel(): void {
    this.selectFeed(this.nextChannel().feed);
  }

  onBackdropClick(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === event.currentTarget) {
      dialog.close();
    }
  }
}
