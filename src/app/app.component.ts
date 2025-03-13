import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "./service/theme.service";
import { ThemeToggleComponent } from "./component/theme-toggle/theme-toggle.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ThemeToggleComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  providers: [ThemeService],
})
export class AppComponent {
  title = "chessfield-live";
  isLoading: boolean = false;
}
