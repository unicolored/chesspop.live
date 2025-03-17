import { Component } from "@angular/core";
import { faPopcorn } from "@fortawesome/sharp-duotone-solid-svg-icons";
import { FaDuotoneIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-about",
  imports: [FaDuotoneIconComponent],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.css",
})
export class AboutComponent {
  protected readonly faPopcorn = faPopcorn;
}
