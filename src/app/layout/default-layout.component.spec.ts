import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DefaultLayoutComponent } from './default-layout.component';

describe('DefaultLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the layout', () => {
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the app header', () => {
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar')?.textContent).toContain('ChessPop Live');
  });

  it('links the header to the home and About pages', () => {
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    fixture.detectChanges();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.navbar a')).map(link =>
      link.getAttribute('href'),
    );

    expect(links).toEqual(['/', '/watch', '/about']);
  });
});
