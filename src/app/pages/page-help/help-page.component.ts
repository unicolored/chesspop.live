import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HelpContentComponent } from '../../component/help/help-content.component';

@Component({
  selector: 'app-help-page',
  imports: [HelpContentComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.css',
})
export class HelpPageComponent {}
