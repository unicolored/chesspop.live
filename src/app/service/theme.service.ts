import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AudioService } from "./audio.service";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  audioService = inject(AudioService);
  private darkMode = signal<boolean>(false);
  isDarkMode = computed<boolean>(() => this.darkMode());
  private soundsOn = signal<boolean>(false);
  isSoundsOn = computed<boolean>(() => this.soundsOn());

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

  toggleMode() {
    const darkMode = this.isDarkMode();
    this.darkMode.set(!darkMode);
  }

  setDarkMode(toggle: boolean) {
    this.darkMode.set(toggle);
  }

  toggleSounds() {
    const soundsOn = this.isSoundsOn();
    this.soundsOn.set(!soundsOn);
    this.audioService.initSounds(!soundsOn);
  }

  setSoundsOn(toggle: boolean) {
    this.soundsOn.set(toggle);
  }
}
