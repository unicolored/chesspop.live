import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { type Angle, type Chessfield, type Mode, type ThemeColors } from 'chessfield';

import {
  angleForCamera,
  type Camera,
  CAMERA_CYCLE,
  DEFAULT_ANGLE,
  DEFAULT_CAMERA,
  DEFAULT_THEME,
  isAngle,
  isCamera,
  isTheme,
  type Theme,
  THEME_CYCLE,
} from '../board/chessfield-themes';

const STORAGE_KEYS = { theme: 'theme', camera: 'camera', cameraAngle: 'cameraAngle' } as const;

@Injectable({
  providedIn: 'root',
})
export class ChessfieldService {
  private platformID = inject(PLATFORM_ID);

  private chessfield = signal<Chessfield | null>(null);
  // Version counter to trigger recomputation when theme or mode changes
  private themeVersion = signal(0);

  private theme = signal<Theme>(this.restoreTheme());
  // Public readonly signal for components to subscribe
  readonly currentTheme = this.theme.asReadonly();

  private camera = signal<Camera>(this.restoreCamera());
  // Public readonly signal for components to subscribe
  readonly currentCamera = this.camera.asReadonly();

  private cameraAngle = signal<Angle | undefined>(this.restoreCameraAngle());
  // Public readonly signal for components to subscribe
  readonly currentCameraAngle = this.cameraAngle.asReadonly();

  // Public readonly signal for components to subscribe
  readonly chessfieldInstance = this.chessfield.asReadonly();

  // Computed theme colors - reactive to chessfield instance AND theme version
  readonly themeColors = computed<ThemeColors | null>(() => {
    this.themeVersion(); // Subscribe to version changes
    const cf = this.chessfield();
    return cf ? cf.getThemeColors() : null;
  });

  // Computed current mode - reactive to theme version (which increments on mode switch)
  readonly currentMode = computed<Mode>(() => {
    this.themeVersion(); // Subscribe to version changes
    const cf = this.chessfield();
    return cf ? cf.getCurrentMode() : 'light';
  });

  register(chessfield: Chessfield): void {
    this.chessfield.set(chessfield);
  }

  unregister(): void {
    this.chessfield.set(null);
  }

  switchTheme(theme?: string): void {
    const next = theme ?? this.nextTheme();
    if (!isTheme(next)) {
      console.warn(`Unknown theme "${next}". Available: ${THEME_CYCLE.join(', ')}`);
      return;
    }

    this.theme.set(next);
    this.persist(STORAGE_KEYS.theme, next);
    this.chessfield()?.switchTheme(next);
    // Increment version to trigger themeColors recomputation
    this.themeVersion.update(v => v + 1);
  }

  switchCamera(camera?: string): void {
    const next = camera ?? this.nextCamera();
    if (!isCamera(next)) {
      console.warn(`Unknown camera "${next}". Available: ${CAMERA_CYCLE.join(', ')}`);
      return;
    }

    // Persist the framing too: white/black are viewed face-on after a switch,
    // which is not the angle the board is created with.
    const angle = angleForCamera(next);
    this.camera.set(next);
    this.cameraAngle.set(angle);
    this.persist(STORAGE_KEYS.camera, next);
    this.persistOptional(STORAGE_KEYS.cameraAngle, angle);
    this.chessfield()?.switchCamera(next);
  }

  switchMode(mode?: Mode): void {
    const cf = this.chessfield();
    if (cf) {
      cf.switchMode(mode);
      // Increment version to trigger reactivity
      this.themeVersion.update(v => v + 1);
    }
  }

  getThemeColors(): ThemeColors | null {
    const cf = this.chessfield();
    return cf ? cf.getThemeColors() : null;
  }

  private nextTheme(): Theme {
    const index = THEME_CYCLE.indexOf(this.theme());
    return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
  }

  private nextCamera(): Camera {
    const index = CAMERA_CYCLE.indexOf(this.camera());
    return CAMERA_CYCLE[(index + 1) % CAMERA_CYCLE.length];
  }

  private restoreTheme(): Theme {
    const stored = this.read(STORAGE_KEYS.theme);
    return stored && isTheme(stored) ? stored : DEFAULT_THEME;
  }

  private restoreCamera(): Camera {
    const stored = this.read(STORAGE_KEYS.camera);
    return stored && isCamera(stored) ? stored : DEFAULT_CAMERA;
  }

  private restoreCameraAngle(): Angle | undefined {
    const stored = this.read(STORAGE_KEYS.cameraAngle);
    if (stored !== null) {
      return isAngle(stored) ? stored : undefined;
    }
    // Nothing stored for the camera at all: first visit, keep the app's default framing.
    return this.read(STORAGE_KEYS.camera) === null ? DEFAULT_ANGLE : undefined;
  }

  private read(key: string): string | null {
    return isPlatformBrowser(this.platformID) ? localStorage.getItem(key) : null;
  }

  private persist(key: string, value: string): void {
    if (isPlatformBrowser(this.platformID)) {
      localStorage.setItem(key, value);
    }
  }

  private persistOptional(key: string, value: string | undefined): void {
    if (!isPlatformBrowser(this.platformID)) {
      return;
    }
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }
}
