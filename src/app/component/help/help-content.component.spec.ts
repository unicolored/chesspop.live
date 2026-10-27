import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpContentComponent } from './help-content.component';

describe('HelpContentComponent', () => {
  let fixture: ComponentFixture<HelpContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpContentComponent);
    fixture.detectChanges();
  });

  it('explains channels and desktop mouse controls', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Pick a channel to jump straight into a live game.');
    expect(text).toContain('Click the channel badge to switch: bullet → blitz → rapid.');
    expect(text).toContain('Middle-button drag');
    expect(text).toContain('Scroll');
    expect(text).toContain('Right-click a square');
    expect(text).toContain('Left-click');
  });

  it('explains touch controls', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Swipe');
    expect(text).toContain('Pinch');
  });

  it('keeps the popcorn send-off', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Grab some pop');
  });
});
