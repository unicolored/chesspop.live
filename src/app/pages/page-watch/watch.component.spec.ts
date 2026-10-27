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
  });

  function stubBoard(): StubLiveBoardComponent {
    return fixture.debugElement.query(By.directive(StubLiveBoardComponent))
      .componentInstance as StubLiveBoardComponent;
  }

  function channelButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.watch-channels button'));
  }

  it('renders the sidebar and the board stage without a navbar', () => {
    expect(fixture.nativeElement.querySelector('.watch-sidebar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.watch-stage')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.navbar')).toBeNull();
  });

  it('links the logo to the homepage and About to its page', () => {
    const logo = fixture.nativeElement.querySelector('.watch-logo') as HTMLAnchorElement;
    const about = fixture.nativeElement.querySelector('.watch-pages a') as HTMLAnchorElement;

    expect(logo.getAttribute('href')).toBe('/');
    expect(logo.textContent).toContain('ChessPop');
    expect(about.getAttribute('href')).toBe('/about');
    expect(about.textContent).toContain('About');
  });

  it('lists every Lichess channel with the default one active', () => {
    const buttons = channelButtons();

    expect(buttons.length).toBe(4);
    expect(buttons[0].textContent).toContain('Lichess - top');
    expect(buttons[0].classList).toContain('active');
    expect(stubBoard().feed()).toBe('Lichess-top');
  });

  it('switches the feed when a channel is selected', () => {
    const buttons = channelButtons();

    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedFeed()).toBe('Lichess-blitz');
    expect(buttons[0].classList).not.toContain('active');
    expect(buttons[1].classList).toContain('active');
    expect(stubBoard().feed()).toBe('Lichess-blitz');
  });
});
