import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpPageComponent } from './help-page.component';

describe('HelpPageComponent', () => {
  let fixture: ComponentFixture<HelpPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPageComponent);
    fixture.detectChanges();
  });

  it('renders the help heading and content', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('How to watch');
    expect(compiled.querySelector('app-help-content')).not.toBeNull();
    expect(compiled.textContent).toContain('Middle-button drag');
  });
});
