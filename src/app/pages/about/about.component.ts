import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePopcorn } from '@lucide/angular';

@Component({
  selector: 'app-about',
  imports: [LucidePopcorn],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about.component.css',
})
export class AboutComponent {}
