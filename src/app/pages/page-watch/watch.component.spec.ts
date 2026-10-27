import { Component, input } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { type LiveFeed } from '../../board/live.interface';
import { LiveBoardComponent } from '../../component/live-board/live-board.component';
import { ThemeToggleComponent } from '../../component/theme-toggle/theme-toggle.component';

import { WatchComponent } from './watch.component';

const HELP_HIDDEN_KEY = 'helpHidden';

@Component({
  selector: 'app-live-board',
  template: '',
})
class StubLiveBoardComponent {
  feed = input.required<LiveFeed>();
}

describe('WatchComponent', () => {
  let fixture: ComponentFixture<WatchComponent>;

  beforeEach(async () => {
    localStorage.removeItem(HELP_HIDDEN_KEY);

    await TestBed.configureTestingModule({
      imports: [WatchComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(WatchComponent, {
        remove: { imports: [LiveBoardComponent] },
        add: { imports: [StubLiveBoardComponent, ThemeToggleComponent] },
      })
      .compileComponents();

    createFixture();
  });

  afterEach(() => {
    if (fixture) {
      closeDialog(menu());
      closeDialog(help());
    }
    localStorage.removeItem(HELP_HIDDEN_KEY);
  });

  function createFixture(): void {
    fixture = TestBed.createComponent(WatchComponent);
    fixture.detectChanges();
  }

  function menu(): HTMLDialogElement {
    return fixture.nativeElement.querySelector('dialog.watch-menu') as HTMLDialogElement;
  }

  function help(): HTMLDialogElement {
    return fixture.nativeElement.querySelector('dialog.watch-help') as HTMLDialogElement;
  }

  function closeDialog(dialog: HTMLDialogElement): void {
    if (dialog?.open) {
      dialog.close();
    }
  }

  function stubBoard(): StubLiveBoardComponent {
    return fixture.debugElement.query(By.directive(StubLiveBoardComponent))
      .componentInstance as StubLiveBoardComponent;
  }

  function channelButtons(scope: ParentNode): HTMLButtonElement[] {
    return Array.from(scope.querySelectorAll('.watch-channels button'));
  }

  function pageButtons(scope: ParentNode): HTMLButtonElement[] {
    return Array.from(scope.querySelectorAll('.watch-pages button'));
  }

  function openMenu(): void {
    (fixture.nativeElement.querySelector('.watch-menu-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  it('renders the sidebar and the board stage without a navbar', () => {
    expect(fixture.nativeElement.querySelector('.watch-sidebar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.watch-stage')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.navbar')).toBeNull();
  });

  it('offers the popcorn trigger for the mobile menu', () => {
    const trigger = fixture.nativeElement.querySelector('.watch-menu-toggle') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-label')).toBe('Open channels');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('links the logo to the homepage and About to its page', () => {
    const sidebar = fixture.nativeElement.querySelector('.watch-sidebar') as HTMLElement;
    const logo = sidebar.querySelector('.watch-logo') as HTMLAnchorElement;
    const about = sidebar.querySelector('.watch-pages a') as HTMLAnchorElement;

    expect(logo.getAttribute('href')).toBe('/');
    expect(logo.textContent).toContain('ChessPop');
    expect(about.getAttribute('href')).toBe('/about');
    expect(about.textContent).toContain('About');
  });

  it('lists every Lichess channel with the default one active', () => {
    const buttons = channelButtons(fixture.nativeElement.querySelector('.watch-sidebar') as HTMLElement);

    expect(buttons.length).toBe(3);
    expect(buttons.map(button => button.textContent?.trim())).toEqual(['bullet', 'blitz', 'rapid']);
    expect(buttons[0].classList).toContain('active');
    expect(stubBoard().feed()).toBe('Lichess-bullet');
  });

  it('gives each Lichess channel its own speed icon', () => {
    const buttons = channelButtons(fixture.nativeElement.querySelector('.watch-sidebar') as HTMLElement);
    const icons = buttons.map(button => button.querySelector('svg') as SVGElement | null);

    expect(icons.every(icon => icon !== null)).toBe(true);
    expect(icons.map(icon => icon?.classList.contains('lucide-rocket'))).toEqual([true, false, false]);
    expect(icons.map(icon => icon?.classList.contains('lucide-zap'))).toEqual([false, true, false]);
    expect(icons.map(icon => icon?.classList.contains('lucide-clock'))).toEqual([false, false, true]);
    expect(icons.every(icon => icon?.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('switches the feed when a channel is selected', () => {
    const buttons = channelButtons(fixture.nativeElement.querySelector('.watch-sidebar') as HTMLElement);

    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedFeed()).toBe('Lichess-blitz');
    expect(buttons[0].classList).not.toContain('active');
    expect(buttons[1].classList).toContain('active');
    expect(stubBoard().feed()).toBe('Lichess-blitz');
  });

  it('opens the menu from the popcorn trigger', () => {
    expect(menu().open).toBe(false);

    openMenu();

    expect(menu().open).toBe(true);
  });

  it('closes the menu after choosing a channel', () => {
    openMenu();

    const buttons = channelButtons(menu());
    buttons[2].click();
    fixture.detectChanges();

    expect(menu().open).toBe(false);
    expect(fixture.componentInstance.selectedFeed()).toBe('Lichess-rapid');
    expect(stubBoard().feed()).toBe('Lichess-rapid');
  });

  it('closes the menu when clicking the backdrop', () => {
    openMenu();

    menu().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(menu().open).toBe(false);
  });

  it('closes the menu from its close button', () => {
    openMenu();

    (menu().querySelector('.watch-menu-close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(menu().open).toBe(false);
  });

  it('offers the same pages in the menu', () => {
    const links = Array.from(menu().querySelectorAll('.watch-pages a')).map(link =>
      link.getAttribute('href'),
    );
    const buttons = pageButtons(menu()).map(button => button.textContent?.trim());

    expect(links).toEqual(['/about']);
    expect(buttons).toEqual(['Help']);
  });

  it('opens the help popup on the first visit', () => {
    expect(help().open).toBe(true);
    expect(help().textContent).toContain('Select a channel. Wait for the next move.');
    expect(help().textContent).toContain('Middle-button drag');
    expect(help().textContent).toContain('Pinch');
  });

  it('keeps the help popup hidden after the user hides it', () => {
    help().close();
    localStorage.setItem(HELP_HIDDEN_KEY, 'true');
    fixture.destroy();

    createFixture();

    expect(help().open).toBe(false);
  });

  it('hides the help popup and remembers it', () => {
    (help().querySelector('.watch-help-hide') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(help().open).toBe(false);
    expect(localStorage.getItem(HELP_HIDDEN_KEY)).toBe('true');
  });

  it('closes the help popup on a backdrop click without remembering it', () => {
    help().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(help().open).toBe(false);
    expect(localStorage.getItem(HELP_HIDDEN_KEY)).toBeNull();
  });

  it('reopens the help popup from the sidebar Help item', () => {
    (help().querySelector('.watch-help-hide') as HTMLButtonElement).click();
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('.watch-sidebar') as HTMLElement;
    const helpButton = pageButtons(sidebar).find(button => button.textContent?.trim() === 'Help');
    helpButton?.click();
    fixture.detectChanges();

    expect(help().open).toBe(true);
  });

  it('closes the mobile menu when Help is chosen', () => {
    help().close();
    openMenu();

    const helpButton = pageButtons(menu()).find(button => button.textContent?.trim() === 'Help');
    helpButton?.click();
    fixture.detectChanges();

    expect(menu().open).toBe(false);
    expect(help().open).toBe(true);
  });
});
