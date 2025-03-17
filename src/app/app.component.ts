import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "./service/theme.service";
import { ThemeToggleComponent } from "./component/theme-toggle/theme-toggle.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPopcorn } from "@fortawesome/sharp-duotone-solid-svg-icons";
import { StreamService } from "./service/stream.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ThemeToggleComponent, FontAwesomeModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  providers: [ThemeService],
})
export class AppComponent {
  title = "chessfield-live";

  streamService = inject(StreamService);
  protected readonly faPopcorn = faPopcorn;
}
