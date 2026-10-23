import { computed, Injectable, signal } from '@angular/core';
import { type Camera, type Chessfield, type Mode, type ThemeColors } from 'chessfield';

@Injectable({
  providedIn: 'root',
})
export class ChessfieldService {
  private chessfield = signal<Chessfield | null>(null);
  // Version counter to trigger recomputation when theme changes
  private themeVersion = signal(0);

  // Public readonly signal for components to subscribe
  readonly chessfieldInstance = this.chessfield.asReadonly();

  // Computed theme colors - reactive to chessfield instance AND theme version
  readonly themeColors = computed<ThemeColors | null>(() => {
    this.themeVersion(); // Subscribe to version changes
    const cf = this.chessfield();
    return cf ? cf.getThemeColors() : null;
  });

  // Computed current camera - reactive to theme version (which increments on camera switch)
  readonly currentCamera = computed<Camera | undefined>(() => {
    this.themeVersion(); // Subscribe to version changes
    const cf = this.chessfield();
    return cf ? cf.getCurrentCamera() : 'white';
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
    const cf = this.chessfield();
    if (cf) {
      cf.switchTheme(theme);
      // Increment version to trigger themeColors recomputation
      this.themeVersion.update(v => v + 1);
    }
  }

  switchCamera(camera?: string): void {
    const cf = this.chessfield();
    if (cf) {
      cf.switchCamera(camera);
      // Increment version to trigger reactivity
      this.themeVersion.update(v => v + 1);
    }
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
}
