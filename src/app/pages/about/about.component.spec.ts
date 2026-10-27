import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the project description and links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a')).map(link => link.getAttribute('href'));

    expect(compiled.querySelector('h1')?.textContent).toContain('About');
    expect(compiled.textContent).toContain('ChessPop');
    expect(links).toContain('https://github.com/unicolored/chesspop.live');
    expect(links).toContain('https://github.com/unicolored/chesspop.live/issues');
  });
});
