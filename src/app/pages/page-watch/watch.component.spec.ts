import { Component, input } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { type LiveFeed } from '../../board/live.interface';
import { LiveBoardComponent } from '../../component/live-board/live-board.component';

import { WatchComponent } from './watch.component';

@Component({
  selector: 'app-live-board',
  template: '',
})
class StubLiveBoardComponent {
  feed = input.required<LiveFeed>();
}

describe('WatchComponent', () => {
  let fixture: ComponentFixture<WatchComponent>;
  let menu: HTMLDialogElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(WatchComponent, {
        remove: { imports: [LiveBoardComponent] },
        add: { imports: [StubLiveBoardComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WatchComponent);
    fixture.detectChanges();
    menu = fixture.nativeElement.querySelector('dialog.watch-menu') as HTMLDialogElement;
  });

  afterEach(() => {
    if (menu.open) {
      menu.close();
    }
  });

  function stubBoard(): StubLiveBoardComponent {
    return fixture.debugElement.query(By.directive(StubLiveBoardComponent))
      .componentInstance as StubLiveBoardComponent;
  }

  function channelButtons(scope: ParentNode): HTMLButtonElement[] {
    return Array.from(scope.querySelectorAll('.watch-channels button'));
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

    expect(buttons.length).toBe(4);
    expect(buttons[0].textContent).toContain('Lichess - top');
    expect(buttons[0].classList).toContain('active');
    expect(stubBoard().feed()).toBe('Lichess-top');
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
    expect(menu.open).toBe(false);

    openMenu();

    expect(menu.open).toBe(true);
  });

  it('closes the menu after choosing a channel', () => {
    openMenu();

    const buttons = channelButtons(menu);
    buttons[2].click();
    fixture.detectChanges();

    expect(menu.open).toBe(false);
    expect(fixture.componentInstance.selectedFeed()).toBe('Lichess-bullet');
    expect(stubBoard().feed()).toBe('Lichess-bullet');
  });

  it('closes the menu when clicking the backdrop', () => {
    openMenu();

    menu.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(menu.open).toBe(false);
  });

  it('closes the menu from its close button', () => {
    openMenu();

    (menu.querySelector('.watch-menu-close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(menu.open).toBe(false);
  });

  it('offers the same pages in the menu', () => {
    const links = Array.from(menu.querySelectorAll('.watch-pages a')).map(link => link.getAttribute('href'));

    expect(links).toEqual(['/about']);
  });
});
