import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioService } from '../../service/audio.service';
import { ChessfieldService } from '../../service/chessfield.service';
import { FullscreenService } from '../../service/fullscreen.service';
import { ThemeService } from '../../service/theme.service';

import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let component: ThemeToggleComponent;
  let themeService: ThemeService;
  let chessfieldService: ChessfieldService;
  let fullscreenService: FullscreenService;
  let audioService: AudioService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    chessfieldService = TestBed.inject(ChessfieldService);
    fullscreenService = TestBed.inject(FullscreenService);
    audioService = TestBed.inject(AudioService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles the theme mode', () => {
    themeService.setDarkMode(true);

    component.toggleMode();
    expect(themeService.isDarkMode()).toBe(false);

    component.toggleMode();
    expect(themeService.isDarkMode()).toBe(true);
  });

  it('cycles the chessfield theme and camera', () => {
    spyOn(chessfieldService, 'switchTheme');
    spyOn(chessfieldService, 'switchCamera');

    component.cycleTheme();
    component.cycleCamera();

    expect(chessfieldService.switchTheme).toHaveBeenCalled();
    expect(chessfieldService.switchCamera).toHaveBeenCalled();
  });

  it('toggles sounds through the audio service', () => {
    spyOn(audioService, 'initSounds');

    component.toggleSounds();

    expect(audioService.initSounds).toHaveBeenCalledWith(true);
  });

  it('delegates fullscreen to the fullscreen service', async () => {
    spyOn(fullscreenService, 'toggleFullscreen').and.resolveTo();

    await component.toggleFullscreen();

    expect(fullscreenService.toggleFullscreen).toHaveBeenCalled();
  });
});
