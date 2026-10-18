import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LucidePopcorn } from "@lucide/angular";
import { ThemeService } from "./service/theme.service";
import { ThemeToggleComponent } from "./component/theme-toggle/theme-toggle.component";
import { StreamService } from "./service/stream.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ThemeToggleComponent, LucidePopcorn],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ThemeService],
})
export class AppComponent {
  title = "chessfield-live";

  streamService = inject(StreamService);
}
