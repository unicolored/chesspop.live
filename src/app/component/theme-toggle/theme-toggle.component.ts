import { Component, effect, inject, PLATFORM_ID, OnInit } from "@angular/core";
import { ThemeService } from "../../service/theme.service";
import { CommonModule, isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-theme-toggle",
  imports: [CommonModule],
  templateUrl: "./theme-toggle.component.html",
  styleUrl: "./theme-toggle.component.css",
})
export class ThemeToggleComponent implements OnInit {
  themeService = inject(ThemeService);
  isDarkMode = this.themeService.isDarkMode();
  platformID = inject(PLATFORM_ID);

  ngOnInit() {
    const isBrowser = isPlatformBrowser(this.platformID);
    if (isBrowser) {
      const darkMode = window.localStorage.getItem("darkMode") ?? "light";
      console.log("stored", darkMode);
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
