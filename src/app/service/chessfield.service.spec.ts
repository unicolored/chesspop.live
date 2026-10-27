import { TestBed } from '@angular/core/testing';
import { type Chessfield } from 'chessfield';

import { ChessfieldService } from './chessfield.service';

describe('ChessfieldService', () => {
  /** A fresh injector per call simulates a page reload: only localStorage survives. */
  function createService(): ChessfieldService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(ChessfieldService);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts with the app defaults on a first visit', () => {
    const service = createService();

    expect(service.currentTheme()).toBe('chesspop');
    expect(service.currentCamera()).toBe('white');
    expect(service.currentCameraAngle()).toBe('right');
  });

  it('cycles cameras through the chessfield order', () => {
    const service = createService();

    service.switchCamera();

    expect(service.currentCamera()).toBe('right');
  });

  it('stores a camera picked by name together with its framing', () => {
    const service = createService();

    service.switchCamera('black');

    expect(localStorage.getItem('camera')).toBe('black');
    expect(localStorage.getItem('cameraAngle')).toBe('center');
  });

  it('stores the theme when cycling', () => {
    const service = createService();

    service.switchTheme();

    expect(service.currentTheme()).toBe('blue');
    expect(localStorage.getItem('theme')).toBe('blue');
  });

  it('restores theme, camera and framing after a reload', () => {
    const first = createService();
    first.switchTheme('bw');
    first.switchCamera('black');

    const reloaded = createService();

    expect(reloaded.currentTheme()).toBe('bw');
    expect(reloaded.currentCamera()).toBe('black');
    expect(reloaded.currentCameraAngle()).toBe('center');
  });

  it('drops the stored framing for cameras that are not viewed face-on', () => {
    const service = createService();
    service.switchCamera('black');

    service.switchCamera('top');

    expect(localStorage.getItem('camera')).toBe('top');
    expect(localStorage.getItem('cameraAngle')).toBeNull();
    expect(service.currentCameraAngle()).toBeUndefined();
  });

  it('falls back to defaults for unknown stored values', () => {
    localStorage.setItem('theme', 'nope');
    localStorage.setItem('camera', 'nope');
    localStorage.setItem('cameraAngle', 'nope');

    const service = createService();

    expect(service.currentTheme()).toBe('chesspop');
    expect(service.currentCamera()).toBe('white');
    expect(service.currentCameraAngle()).toBeUndefined();
  });

  it('ignores an unknown camera without storing it', () => {
    const service = createService();
    spyOn(console, 'warn');

    service.switchCamera('sideways');

    expect(service.currentCamera()).toBe('white');
    expect(localStorage.getItem('camera')).toBeNull();
  });

  it('applies switches to the registered chessfield instance', () => {
    const service = createService();
    const chessfield = {
      switchTheme: jasmine.createSpy('switchTheme'),
      switchCamera: jasmine.createSpy('switchCamera'),
    } as unknown as Chessfield;
    service.register(chessfield);

    service.switchCamera('white');
    service.switchTheme('green');

    expect(chessfield.switchCamera).toHaveBeenCalledWith('white');
    expect(chessfield.switchTheme).toHaveBeenCalledWith('green');
  });

  it('applies mode switches to the registered chessfield instance', () => {
    const service = createService();
    const chessfield = {
      switchMode: jasmine.createSpy('switchMode'),
    } as unknown as Chessfield;
    service.register(chessfield);

    service.switchMode('dark');

    expect(chessfield.switchMode).toHaveBeenCalledWith('dark');
  });
});
