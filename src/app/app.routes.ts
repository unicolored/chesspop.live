import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    loadComponent: () =>
      import("./pages/page-live/live.component").then((m) => m.LiveComponent),
  },
];
