import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucidePopcorn } from '@lucide/angular';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, LucidePopcorn],
  templateUrl: './default-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLayoutComponent {}
