import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply the mode to the document root', () => {
    TestBed.tick();

    service.setDarkMode(false);
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    service.setDarkMode(true);
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
