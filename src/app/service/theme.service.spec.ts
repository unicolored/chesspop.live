import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio.service';
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

  it('toggles sounds through the audio service', () => {
    const audioService = TestBed.inject(AudioService);
    spyOn(audioService, 'initSounds');

    service.toggleSounds();
    expect(service.isSoundsOn()).toBe(true);
    expect(audioService.initSounds).toHaveBeenCalledWith(true);

    service.toggleSounds();
    expect(service.isSoundsOn()).toBe(false);
    expect(audioService.initSounds).toHaveBeenCalledWith(false);
  });
});
