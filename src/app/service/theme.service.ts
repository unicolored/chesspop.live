import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private darkMode = signal<boolean>(false);
  isDarkMode = computed<boolean>(() => this.darkMode());

  platformID = inject(PLATFORM_ID);

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformID);

    if (isBrowser) {
      // Check if user has a preferred theme
      // const prefersDark = window.matchMedia(
      //   "(prefers-color-scheme: dark)",
      // ).matches;
      // this.darkMode.set(prefersDark);

      const darkMode = localStorage.getItem("darkMode") ?? "light";
      this.darkMode.set(darkMode === "dark");
    }

    effect(() => {
      if (isBrowser) {
        localStorage.setItem("darkMode", this.isDarkMode() ? "dark" : "light");
      }
    });
  }

  toggleTheme() {
    const darkMode = this.isDarkMode();
    this.darkMode.set(!darkMode);
  }

  setDarkMode(dark: boolean) {
    this.darkMode.set(dark);
  }
}
