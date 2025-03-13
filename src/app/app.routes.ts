import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    loadComponent: () =>
      import("./pages/page-home/home.component").then((m) => m.HomeComponent),
  },
];
