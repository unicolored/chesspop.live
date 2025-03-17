import { Component, inject, PLATFORM_ID, OnInit } from "@angular/core";
import { ThemeService } from "../../service/theme.service";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  faLightbulbOn,
  faLightbulbSlash,
} from "@fortawesome/sharp-duotone-solid-svg-icons";
import { FaDuotoneIconComponent } from "@fortawesome/angular-fontawesome";

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

  ngOnInit() {
    const isBrowser = isPlatformBrowser(this.platformID);
    if (isBrowser) {
      const darkMode = localStorage.getItem("darkMode") ?? "light";
      const isDarkMode = darkMode === "dark";

      this.setDarkMode(isDarkMode);
    }
  }

  setDarkMode(dark: boolean) {
    this.themeService.setDarkMode(dark);
    this.updateTheme(dark);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.updateTheme(this.themeService.isDarkMode());
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
