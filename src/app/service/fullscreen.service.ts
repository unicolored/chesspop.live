import { isPlatformBrowser } from '@angular/common';
import { effect, Inject, Injectable, type OnDestroy, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FullscreenService implements OnDestroy {
  private wrapper = signal<HTMLElement | null>(null);
  readonly isFullscreen = signal(false);

  readonly wrapperElement = this.wrapper.asReadonly();

  private fullscreenHandler: (() => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const wrapper = this.wrapper();
        if (wrapper) {
          this.fullscreenHandler = () => {
            this.isFullscreen.set(document.fullscreenElement === wrapper);
          };
          document.addEventListener('fullscreenchange', this.fullscreenHandler);
          this.isFullscreen.set(document.fullscreenElement === wrapper);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.fullscreenHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenHandler);
    }
  }

  registerWrapper(wrapper: HTMLElement): void {
    this.wrapper.set(wrapper);
  }

  unregisterWrapper(): void {
    this.wrapper.set(null);
  }

  async toggleFullscreen(): Promise<void> {
    const wrapper = this.wrapper();
    if (!wrapper) return;

    try {
      if (document.fullscreenElement === wrapper) {
        await document.exitFullscreen();
      } else {
        await wrapper.requestFullscreen({ navigationUI: 'hide' });
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  }
}
