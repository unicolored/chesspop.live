import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit, PLATFORM_ID } from '@angular/core';
import { LucideMoon, LucideSun, LucideVolume2, LucideVolumeX } from '@lucide/angular';

import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [LucideMoon, LucideSun, LucideVolume2, LucideVolumeX],
  templateUrl: './theme-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './theme-toggle.component.css',
})
export class ThemeToggleComponent implements OnInit {
  themeService = inject(ThemeService);
  isDarkMode = this.themeService.isDarkMode();
  platformID = inject(PLATFORM_ID);

  ngOnInit() {
    const isBrowser = isPlatformBrowser(this.platformID);
    if (isBrowser) {
      const darkMode = localStorage.getItem('darkMode') ?? 'dark';
      const isDarkMode = darkMode === 'dark';

      this.setDarkMode(isDarkMode);
      this.setSoundsOn(false);
    }
  }

  setDarkMode(toggle: boolean) {
    this.themeService.setDarkMode(toggle);
    this.updateTheme(toggle);
  }

  setSoundsOn(toggle: boolean) {
    this.themeService.setSoundsOn(toggle);
  }

  toggleMode() {
    this.themeService.toggleMode();
    this.updateTheme(this.themeService.isDarkMode());
  }

  toggleSounds() {
    this.themeService.toggleSounds();
  }

  private updateTheme(dark: boolean) {
    this.isDarkMode = dark;
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}
