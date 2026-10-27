import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  LucideArrowDown,
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowUp,
  LucideCamera,
  LucideMaximize,
  LucideMinimize,
  LucideMoon,
  LucidePalette,
  LucideSun,
  LucideVolume2,
  LucideVolumeX,
} from '@lucide/angular';

import { ChessfieldService } from '../../service/chessfield.service';
import { FullscreenService } from '../../service/fullscreen.service';
import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [
    LucideArrowDown,
    LucideArrowLeft,
    LucideArrowRight,
    LucideArrowUp,
    LucideCamera,
    LucideMaximize,
    LucideMinimize,
    LucideMoon,
    LucidePalette,
    LucideSun,
    LucideVolume2,
    LucideVolumeX,
  ],
  templateUrl: './theme-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './theme-toggle.component.css',
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  chessfieldService = inject(ChessfieldService);
  fullscreenService = inject(FullscreenService);

  // Reactive theme colors from chessfield (for button styling)
  themeColors = this.chessfieldService.themeColors;

  // Dynamic camera icon based on current camera position
  cameraIcon = computed(() => {
    const camera = this.chessfieldService.currentCamera();
    switch (camera) {
      case 'white':
        return 'arrow-up';
      case 'right':
        return 'arrow-left';
      case 'black':
        return 'arrow-down';
      case 'left':
        return 'arrow-right';
      case 'top':
        return 'camera';
      default:
        return 'camera';
    }
  });

  toggleMode() {
    this.themeService.toggleMode();
  }

  toggleSounds() {
    this.themeService.toggleSounds();
  }

  /** Cycle to next chessfield theme */
  cycleTheme() {
    this.chessfieldService.switchTheme();
  }

  /** Cycle to next camera position */
  cycleCamera() {
    this.chessfieldService.switchCamera();
  }

  /** Toggle fullscreen for the chessfield canvas */
  async toggleFullscreen(): Promise<void> {
    await this.fullscreenService.toggleFullscreen();
  }
}
