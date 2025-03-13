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
  isDarkMode = this.darkMode.asReadonly();

  platformID = inject(PLATFORM_ID);

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformID);

    if (isBrowser) {
      // Check if user has a preferred theme
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      this.darkMode.set(prefersDark);
    }
    console.log("this.darkMode()", this.darkMode());
    console.log("this.isDarkMode()", this.isDarkMode());

    effect(() => {
      if (isBrowser) {
        window.localStorage.setItem(
          "darkMode",
          this.isDarkMode() ? "dark" : "light",
        );
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
