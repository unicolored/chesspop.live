import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private platformID = inject(PLATFORM_ID);

  initSounds(enable: boolean = false) {
    if (enable) {
      if (isPlatformBrowser(this.platformID)) {
        this.audioContext = new window.AudioContext();
      }
    } else {
      this.audioContext = null;
    }
  }

  playSound(frequency: number, type: OscillatorType, duration: number) {
    console.log("sound!");
    if (isPlatformBrowser(this.platformID)) {
      if (!this.audioContext) return;

      const gainNode = this.audioContext.createGain();

      const osc = this.audioContext.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;

      // Connect the oscillator to the gain node, then to the output
      osc.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set initial volume (0.5 = 50% volume)
      gainNode.gain.setValueAtTime(0.033, this.audioContext.currentTime);

      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    }
  }
}
