import { Component, inject, PLATFORM_ID, OnInit } from "@angular/core";
import { ThemeService } from "../../service/theme.service";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  faLightbulbOn,
  faLightbulbSlash,
  faVolume,
  faVolumeXmark,
} from "@fortawesome/sharp-duotone-solid-svg-icons";
import { FaDuotoneIconComponent } from "@fortawesome/angular-fontawesome";
import { AudioService } from "../../service/audio.service";

@Component({
  selector: "app-theme-toggle",
  imports: [CommonModule, FaDuotoneIconComponent],
  templateUrl: "./theme-toggle.component.html",
  styleUrl: "./theme-toggle.component.css",
})
export class ThemeToggleComponent implements OnInit {
  themeService = inject(ThemeService);
  isDarkMode = this.themeService.isDarkMode();
  platformID = inject(PLATFORM_ID);
  protected readonly light = faLightbulbSlash;
  protected readonly dark = faLightbulbOn;
  protected readonly soundsOn = faVolume;
  protected readonly soundsOff = faVolumeXmark;

  ngOnInit() {
    const isBrowser = isPlatformBrowser(this.platformID);
    if (isBrowser) {
      const darkMode = localStorage.getItem("darkMode") ?? "light";
      const isDarkMode = darkMode === "dark";

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
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }
}
