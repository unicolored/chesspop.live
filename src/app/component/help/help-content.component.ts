import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-help-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p>Select a channel. Wait for the next move.</p>

    <h3 class="mt-4 mb-2 text-xs font-semibold tracking-wider uppercase opacity-70">Mouse</h3>
    <ul class="list-disc space-y-1 pl-5">
      <li>Middle-button drag — orbit the camera.</li>
      <li>Scroll — zoom in and out.</li>
      <li>Right-click a square — place or remove a ring. Hold Alt and/or Ctrl for another ring color.</li>
      <li>Left-click — clear all rings.</li>
      <li>On a trackpad — use the camera button in the top-right to cycle preset views.</li>
    </ul>

    <h3 class="mt-4 mb-2 text-xs font-semibold tracking-wider uppercase opacity-70">Touch</h3>
    <ul class="list-disc space-y-1 pl-5">
      <li>Swipe — orbit the camera.</li>
      <li>Pinch — zoom in and out.</li>
    </ul>

    <p class="mt-4 text-lg font-bold text-red-800 dark:text-red-400">Grab some pop 🍿 Enjoy the show!</p>
  `,
})
export class HelpContentComponent {}
